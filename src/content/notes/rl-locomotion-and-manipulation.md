---
title: "RL for locomotion & manipulation"
date: 2026-11-25
summary: "Locomotion policies, CAN bus latency, PPO, training on visual input, and Adversarial Motion Priors."
---

## Locomotion policy

- **Policy (π):** a function, observation → action. Takes what the robot senses right now and outputs motor commands, run in a loop at a fixed rate.
- Implemented as an **MLP** (multi-layer perceptron, i.e. a fully connected network).
- Menlo's Asimov: `obs(45) → 512 → 256 → 128 → actions(12)`
  - in: IMU, joint positions/velocities, velocity command, previous action
  - out: target positions for the 12 leg joints

## Accounting for latency: CAN bus

- **CAN bus** (Controller Area Network): devices share one pair of wires and send short messages to each other.
- Only one message at a time → motors are polled one after another → signals are out of sync (hips ~6–9 ms staler than ankles).
- Menlo accounts for this by adding matching per-joint-group delays in simulation, so the policy trains on the same timing skew as the hardware.

## PPO (Proximal Policy Optimization)

- RL algorithm that improves the policy a little at a time, never too much in one step.
- Does this by **clipping**: r = π_new(a|s) / π_old(a|s), with r limited to [1−ε, 1+ε] (Menlo: ε = 0.2).
- Prevents *training* instability (a bad update collapsing the policy). Not the same as physical underdamping/oscillation on the robot.

## 3 main ways to train on visual input

1. **End-to-end RL from pixels:** raw camera images straight into RL (e.g. QT-Opt).
   → Simple to set up but very expensive (image rendering limits parallel envs; reward is a weak signal for learning to see).
2. **Teacher-student distillation** (Menlo's choice):
   - Step 1 (RL): exact carton state from sim → TEACHER → actions
   - Step 2 (imitation): camera images → STUDENT → copies the teacher's actions
   - \+ **DAgger** (Dataset Aggregation): plain imitation drifts into states the teacher never visited → fix: let the student drive, have the teacher label what it would do in the states the student reaches, add those labels to the data, retrain → the student learns to recover from its own mistakes.

   → Cheaper but more pipeline.
3. **Modular: pose estimator + state policy** (e.g. IKER): camera → off-the-shelf pose estimator → RL policy → actions.
   → Cheap but fragile (occlusion, symmetry, calibration error, latency go straight into the policy).

## AMP (Adversarial Motion Priors)

A way to make an RL policy move in a particular *style*, learned from example motions instead of hand-written style rewards.

- **Problem:** RL optimizes the reward you write, not the behavior you intend. Hand-crafted rewards create loopholes the policy exploits → endless loop of patches and new exploits without a clean solution (Menlo hit 18 reward terms and still had no clean flip).
- **Solution:** instead of describing the motion, show it. AMP borrows the idea of a GAN (generative adversarial network):
  1. **Reference motion:** record a demonstration (e.g. teleoperation).
  2. **Discriminator:** a second small network that watches short motion snippets and tries to tell "from the demo" apart from "from the policy".
  3. **Style reward:** the policy earns reward when its motion fools the discriminator, i.e. looks like the demo.
     r_style = clamp(1 − 0.25·(d − 1)², 0, 1) — d ≈ 1 (demo-like) → reward 1; d ≈ −1 (clearly policy) → reward 0.

```
policy motion ──┐
                ├──→ discriminator → score d → style reward
demo motion ────┘
```

- **Key idea:** rewards overall style, not exact waypoints → one demo generalizes across conditions (e.g. demo recorded with belt stopped still works with belt moving).
- **Trade-off:** AMP guides *how* the robot moves; task rewards decide *whether* it succeeded. Keep the AMP weight small — too high and the policy just imitates the demo (e.g. holds the carton forever) instead of finishing the task.
