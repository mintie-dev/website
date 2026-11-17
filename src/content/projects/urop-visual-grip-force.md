---
title: "Visual Grip Force Estimation: Fin Ray (FRE) Grippers on iPhUMI"
date: 2026-11-16
summary: "Soft Fin Ray fingers with printed markers turn a phone-based demonstration gripper into a force sensor: the camera watches the fingers bend, and a beam model reads off how hard they squeeze."
fields: [hardware, software]
topics: [computer-vision, ai-ml]
status: done
course: UROP
paper: /documents/urop-final-report.pdf
---

<p><strong><a href="/documents/urop-final-report.pdf" target="_blank" rel="noopener">Read the full UROP report ↗</a></strong></p>

<figure>
  <video src="/assets/urop_force/four-objects.mp4" controls playsinline preload="metadata"></video>
  <figcaption>Estimated grip force while grasping four objects.</figcaption>
</figure>

## The problem

This was my UROP in the Grasping and Manipulation Lab at NUS, supervised by Asst. Prof. Jianshu Zhou, with day-to-day guidance from Hao Wu (September to November 2026).

Robots learn manipulation from demonstrations, and the cheapest way to collect them is a handheld gripper with a camera on it. [UMI](https://umi-gripper.github.io/) does this with a GoPro, and [iPhUMI](https://github.com/real-stanford/iPhUMI) swaps the GoPro for an iPhone that tracks its own pose. Both record what the gripper sees and how it moves, but **not how hard it squeezes**. Crushing a paper cup and holding it gently look almost the same on video.

The usual fix is a force sensor in each finger, but that adds wiring, electronics and syncing to a device whose whole point is being simple. The phone already sees both fingers the whole time, though. If the fingers bent in a predictable way under load, the camera could measure the force for free.

## The idea

Fin Ray fingers are soft triangular frames with crossbeams inside. Press the front and the whole finger wraps around the object. Two things make them a good sensor: they bend enough to see, and the *shape* of the bend depends on where the load is.

So the plan was:

1. **Observe:** put white markers on every joint and track them in the phone's ultrawide video.
2. **Model:** simulate how the printed finger bends for any force *F* at any height *h*.
3. **Invert:** find the *F* and *h* whose predicted bend matches the markers. The size of the bend gives the force, its shape gives the contact height.

<figure>
  <a href="/assets/urop_force/framework.png"><img src="/assets/urop_force/framework.png" alt="Three panels. (a) A camera frame of the gripper holding a box, with markers and red arrows showing how far each moved. (b) A beam model of the finger: blue front beam, orange back beam, green crossbeams, bending under a 10 N load at 60 mm. (c) Predicted outward displacement of the front markers for several loads: bigger force means a bigger curve, and a different contact height changes its shape" loading="lazy" /></a>
  <figcaption>Observe, model, invert (click to enlarge).</figcaption>
</figure>

## Building the gripper

The project started as "build iPhUMI". I printed the released CAD, but the mount was made for an iPhone 15 Pro and the lab had a 16 Pro, which is 3 mm longer. I couldn't just scale it, because iPhUMI's camera-to-gripper transform assumes the camera sits exactly where the 15 Pro's does. So I redesigned the pocket so the bigger phone fits with its main camera in the same place. It took a few iterations, and later the finger markers confirmed the camera sits within 4–6 mm and 0.5° of the stock position.

On 29 October the project turned into force sensing. I started from an [open-source Fin Ray finger](https://grabcad.com/library/gripper-fin-ray-effect-1) and made it a drop-in iPhUMI finger: thickened from 12 to 25.9 mm to fill the holder slot, a new base with the stock three M3 holes (so the gripper's calibration still holds), and rounded pads at each joint to carry the markers. It's printed in black TPU 95A with nine crossbeams.

<figure>
  <a href="/assets/urop_force/cad.png"><img src="/assets/urop_force/cad.png" alt="Exploded and assembled CAD of the gripper: the phone and blue redesigned mount on top, then the top cover, gears, linkages, bottom plate, trigger and grip, two finger holders with ArUco tags, and two black Fin Ray fingers with white marker pins" loading="lazy" /></a>
  <figcaption>The final assembly. The blue mount and the black fingers are the parts I designed; the rest is the released iPhUMI CAD (click to enlarge).</figcaption>
</figure>

<figure>
  <a href="/assets/urop_force/finger.png"><img src="/assets/urop_force/finger.png" alt="Three cross-sections: the original open-source finger with saw-tooth ridges, the adapted finger with marker sites at the joints, and the planar beam model read from it with markers C1–C9 on the front beam and D2–D9 on the back beam" loading="lazy" /></a>
  <figcaption>From the open-source finger, to my version, to the beam model read straight from its STL (click to enlarge).</figcaption>
</figure>

### The markers fought back

The markers had to be white on black TPU, and the only white filament was PLA. I tried about ten dual-material prints and the markers kept falling off: painted in the slicer they were only two layers deep, and PLA barely sticks to TPU anyway. A second design with little ridges to key them in didn't print reliably either.

What worked was giving up on printing them together. The finger is printed in TPU alone with a small recess at each joint, and the markers are printed separately as tiny PLA pins and glued in by hand.

<figure>
  <img class="narrow" src="/assets/urop_force/markers.png" alt="Close-up of the finger: white PLA marker pins printed separately, recesses in the TPU joint pads, pins glued in place, and the M3 mounting hole" loading="lazy" />
  <figcaption>Separate PLA pins glued into recesses, after about ten failed dual-material prints.</figcaption>
</figure>

## Tracking and the force model

**Tracking.** The iPhUMI app records the ultrawide camera at 640 × 480 and 10 Hz, the only stream that sees both fingers whole. Each finger holder has an ArUco tag, so I measure every marker in its own finger's root frame. That way the jaws opening and the phone moving drop out, and only the bending is left. The first tracker sometimes jumped by a whole joint when the tag pose glitched for a frame. Constraining each holder to slide along the opening axis fixed it, and cut the left–right force disagreement from 47% to 25%.

**Model.** The finger is a planar frame of co-rotational beam elements, which handle the big rotations of a soft finger while the material itself stays linear. I validated it against the exact solution for a bending cantilever (under 0.15% error) and against published FE results before touching any real data.

**One number to calibrate.** Because the material is linear, the stiffness *E* only scales the force: the bend depends on *F/E*. So calibrating the whole model against a load cell comes down to fitting one number. It went from a first guess of 40 MPa to 96.5 MPa, and that factor of 2.4 matches how much the uncalibrated model was reading low.

## Results

All the recording happened on 12 November: 20 squeezes of a load cell and 40 handheld grasps.

<figure>
  <img src="/assets/urop_force/grasps.jpg" alt="Four ultrawide frames from the gripper's phone, each showing two black Fin Ray fingers with white markers gripping an object: an acrylic box at 12.1 N, a perfume bottle at 11.0 N, a narrow yellow cuboid at 6.2 N and an orange plush fox at 4.9 N" loading="lazy" />
  <figcaption>What the phone sees during four grasps, with the tracked markers and the estimated grip force at that moment.</figcaption>
</figure>

- **Tracking:** 0.034 mm median marker noise in a clean scene, way below the millimetres the finger bends. The background mattered a lot, though. In front of a keyboard the white keys looked like markers and only 42% of frames had every marker; over a black cloth it was 97–99%.
- **Contact height:** stepping the load cell from root to tip, the estimate read 25, 37, 49, 63 and 85 mm, in perfect order.
- **Force:** on finger-body contacts, an 18% hold error (2.1 N mean absolute error over 1–16 N). Contacts at the very root were missed, since the finger barely bends there.

<figure>
  <a href="/assets/urop_force/load-cell.png"><img src="/assets/urop_force/load-cell.png" alt="Four scatter plots of estimated force against load-cell force for the mid-finger, tip, root and root-to-tip batches; finger-body points lie near the diagonal, root points fall well below it" loading="lazy" /></a>
  <figcaption>Estimated vs. measured force. Blue is contact on the finger body, grey is root or holder contact (click to enlarge).</figcaption>
</figure>

The honest part: over 3000 random calibration/test splits, the physics model didn't beat just guessing the average force, and a ridge regression on the raw markers did. Most squeezes were 10–16 N, so the average is already a strong guess, and the model's error is mostly a **systematic bias with contact height**: the real finger gets stiffer towards the tip than the planar model thinks. One stiffness for the whole finger is the main weakness. A height-dependent response we built with the lab team halved the error near the tip.

### Telling objects apart

Then the real test: 40 handheld grasps of four everyday objects, ten each, with the grip strength deliberately varied. The estimated forces still split them into two clear groups (box and bottle around 10–12 N, cuboid and plush toy around 6–7 N, p = 2 × 10⁻⁶), and adding the contact height separates the box from the bottle.

<figure>
  <a href="/assets/urop_force/objects.png"><img src="/assets/urop_force/objects.png" alt="(a) Hold force of each of the 40 grasps: box and bottle around 9–17 N, cuboid and plush toy around 3–9 N. (b) Each object's mean and spread in contact height vs hold force: bottle at 53 mm and 12.5 N, box at 83 mm and 10.4 N, cuboid and plush toy overlapping near 66–71 mm and 6.5–7 N" loading="lazy" /></a>
  <figcaption>Hold force per grasp, and each object in the plane of contact height and force (click to enlarge).</figcaption>
</figure>

The force traces made physical sense too. The box, held at the fingertips, overshot and then settled. The bottle rose fastest and held flat. The plush toy loaded gradually as it squashed, and hid so much of the fingertips that only 22 of 32 markers were visible.

## What's still missing

- **A height-dependent stiffness**, calibrated at controlled heights. That's where most of the error is.
- **Lighter, longer holds in the calibration.** One sitting of mostly hard squeezes left the low forces and the root barely sampled.
- **Better markers**, press-fit or same-material instead of glued.
- **Actually using it:** writing the per-frame force into the iPhUMI dataset, comparing against fingertip force sensors, and training policies on force-labelled demonstrations.

## What I took away

**Test the cheap thing first.** A small PLA–TPU coupon would have told me in one print that the materials don't bond. Instead it cost about ten finger prints.

**Control the scene from the first recording.** One cluttered calibration lost a whole row of markers. A black cloth fixed it completely.

**Plan the calibration around the error, not convenience.** My load-cell session was easy to record but left gaps exactly where the model is weakest, which is now the main limit on accuracy.

The thing that went right was validating everything before the real data: the beam model in simulation, and the whole pipeline on synthetic video. Lab time was short, and because of that every real session produced usable data.

I used Claude to write most of the software (the tracker, the beam model and the analysis), and ran and tested it all on the lab hardware.
