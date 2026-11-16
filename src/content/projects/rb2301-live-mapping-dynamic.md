---
title: "Live Mapping and Dynamic Obstacle Avoidance — ROS"
date: 2026-11-15
summary: "A mecanum robot that maps an unknown course as it drives, plans through it with A*, backs out of dead ends, and waits for a safe gap to slip past swinging panels."
fields: [software]
topics: [navigation, motion-planning]
status: done
course: RB2301 final project
---

<figure>
  <video src="/assets/rb2301_fp/demo.mp4" controls playsinline preload="metadata"></video>
  <figcaption>Final runs on the real course.</figcaption>
</figure>

## The task

This was the final project for RB2301. The task was to drive a mecanum robot through three corridors joined at right angles. The first two have static obstacles, there's a narrow door between the second and third, and the last one has swinging pendulum panels that the robot has to get past without being hit.

Like the earlier assignments ([reactive avoidance](/projects/rb2301-reactive-avoidance) and [A* path planning](/projects/rb2301-astar-pid)), it was a ROS 2 node, developed in Gazebo first and then run on the real robot at up to 0.3 m/s, with its position coming from OptiTrack. We called the three corridors S1, S2 and S3.

## Splitting the course

Our group split the course into a static part (S1 and S2) and a dynamic part (S3).

The dynamic part we agreed on almost straight away: move to one side of the corridor, watch the panel, and cross when there's a safe gap. At the side, the panel only sweeps past once per swing instead of twice, so waiting there roughly doubles the window to cross.

The static part took much longer. Our first two or three sessions were all brainstorming: reactive avoidance like CA1, live mapping with A* like CA2, wall following (it works, but it's very slow), and even reinforcement learning across lots of parallel Gazebo sessions. We went with **live mapping + A***, with a goal that keeps moving ahead of the robot until the static part is done.

We also made three design choices early on:

- **The robot faces where it goes**, like a car.
- **No fixed goal.** Each section sets a goal relative to the robot and keeps renewing it until some condition says the section is over, so the code works for any course size.
- **No fixed direction.** "Front" and "right" are just whatever the robot faced at the start, so the code works however the course is turned.

<figure>
  <a href="/assets/rb2301_fp/flowchart.png"><img src="/assets/rb2301_fp/flowchart.png" alt="Flowchart: START sets front and right from the start pose and measures S1's width; S1 finds the front wall and runs A* to a goal straight ahead, switching to S2 when the LiDAR to the right jumps or the front wall is close; S2 runs A* to a goal 45° to the right and finds the door itself; 0.35 m past the door, S3 slides to the right wall, stops 0.17 m before the panel line, crosses when the gap is at least 0.38 m and far or growing, and repeats for the second panel before finishing" loading="lazy" /></a>
  <figcaption>How the whole run fits together (click to enlarge).</figcaption>
</figure>

## Building the map as it drives

The robot starts with no map at all. It splits the floor into 5 cm cells, and on every LiDAR scan it walks along each ray: every cell the ray passes through gets −1 (probably empty), and the cell where the ray stops gets +2 (probably a wall). A cell counts as occupied once its score reaches 2.

- **Hits count more than misses**, so a bit of LiDAR noise doesn't wipe out a real wall.
- **The score is capped at 10**, so the map stays responsive. A cell that something has moved out of clears in about 0.9 s, which is fast enough to keep up with a swinging panel.
- **Cells that flip from empty to occupied** mean something moved into them. Those are marked in purple, and in S3, the rows that keep flipping show exactly where the panels swing.

<figure>
  <img src="/assets/rb2301_fp/rviz-map.jpg" alt="Top-down occupancy grid in RViz: white explored floor, black walls, green and red cells at the edges of what the LiDAR has seen, and a dark blue planned path through the corridor" loading="lazy" />
  <figcaption>The live map and A* path in RViz, in simulation. White is free, black is wall, blue is the planned path.</figcaption>
</figure>

## Planning through it with A*

A* runs on this map with 8 neighbours (diagonals allowed this time). A few things make it work on a map that's still being built:

- **Unknown cells count as free.** A* plans optimistically into space it hasn't seen yet, and fixes the path as walls show up.
- **Walls are padded.** Every occupied cell is grown into a disc of 0.16 m (the robot's radius plus 5 cm), so a path through the middle of the padded map keeps the body clear. If there's no path with the padding, it tries again with just the robot's radius and slows down.
- **Cells near walls cost 3×**, so paths keep to the middle of gaps.

To stop the robot dithering between two routes, it keeps its current path and only replans when the goal moves, it drifts more than 25 cm off the path, something new appears on the path ahead, or it reaches the end of a path that stopped short.

To follow the path, it aims at a point 18 cm ahead and slows down as it gets close. The mecanum base slides along the path while a separate controller turns it to face the way it's going. In S1 and S2, it also predicts where its body will be 0.3 s ahead and refuses any move that would hit something.

## Getting out of dead ends

A* alone doesn't solve dead ends. It can happily plan through a gap the robot can't actually fit through, and early on the robot would drive into a dead end and sit there while A* kept planning straight through it.

So if the robot moves less than 10 cm in 3 s, it decides it's stuck. It crosses out two 25 cm discs on the map, one where it is and one just ahead, drops its path and plans again. Crossed-out cells cost 50×, so the next path goes around them, backing out as far as it needs to.

In our 2D test harness, on a world with a long hidden dead end, the robot went from stuck at zero speed to backing out, taking the other lane and finishing in about 38 s without touching anything.

## Finding the door and switching sections

The code is a small state machine: START, S1, S2, WAIT, CROSS and DONE.

- **S1:** the goal is straight ahead. The robot keeps measuring where S1's front wall is, but only within S1's width, so neither an obstacle nor the S2 opening gets mistaken for it. It switches to S2 when the LiDAR to the right suddenly reads 0.6 m further than S1's right wall (the wall has ended), or when the front wall gets within 0.6 m.
- **S2:** the goal is 2 m ahead and 2 m to the right. We originally had a door detector, but it failed on the real course's bent cardboard walls, so we removed it. Once the front wall is on the map, the door is the only way towards the goal, so A* finds it by itself. The robot counts as through once it's 0.35 m past the front wall, when its whole body has cleared the door frame.

## Crossing the panels

In WAIT, the robot slides over to 25 cm from the right wall, facing ahead. It finds the panel line from the cells that keep flipping (the purple ones), stops 17 cm before it, and watches the gap.

We first thought about predicting the panel's swing, but one condition turned out to be enough: the gap has to be **wide enough, and not closing**. After waiting at least 0.5 s, it goes when the gap is either:

- **far:** at least 0.45 m and not closing by more than 2 cm in 0.4 s, or at least 0.38 m and steady (a panel that has stopped), or
- **growing:** at least 0.38 m and widening by at least 2 cm in 0.4 s (the panel is swinging away).

Then it drives straight across without turning until it's 20 cm past the line, and does the same for the second panel.

At one point the 0.3 s no-crash check was still on in S3, and the robot kept dodging the swinging panel, about 17 direction reversals per run. Turning the check off in S3 and only crossing on a safe gap brought that down to about zero.

## Logging everything

Every state change is printed (like `>>> S1 -> S2`), and twice a second the robot prints a status line with its state, position, heading, goal, the front wall it's measured, and the command it's sending.

<figure>
  <a href="/assets/rb2301_fp/status-line.png"><img src="/assets/rb2301_fp/status-line.png" alt="A single status line from the terminal, labelled: time since start, current state, metres ahead and right of the start, heading, current goal, front wall position, where S2 begins, move command and turn rate" loading="lazy" /></a>
  <figcaption>The status line, labelled (click to enlarge).</figcaption>
</figure>

This paid off more than I expected. A failed run could be traced to the exact state and condition, like a front wall that was never found or a gap that never grew, instead of guessing from the video.

We also wrote a small 2D simulator of the course in NumPy, with random worlds, LiDAR, swinging panels and Gazebo's wheel friction. It could test a change on 20 worlds in a few minutes, and it caught both the dead-end trap and the panel dodging before we got to the lab.

## How we got there

The static part took a lot of iterations:

| Step | What we did | What happened |
|---|---|---|
| Live map + A* | Goal = the free cell seen furthest ahead and right | In a dead end, the best cell is inside it, so the robot drove in and stayed. → One fixed far goal instead. |
| Fixed far goal | One target far ahead and right; unknown cells free | The robot stopped getting trapped in pockets. |
| Real course | Measured the real course: much smaller than Gazebo | The door detector failed on bent cardboard. → Removed; A* finds the door. |
| Rewrite | By then ~800 lines and ~85 constants | We couldn't tell which constant did what. → Started again from the template with a few states and one settings block. |
| Dead ends | Cross out and replan over the whole map; no-crash check | Backs out of hidden dead ends and finishes. |
| Panels | No-crash check off in S3 | Dodging went from ~17 reversals per run to ~0. |

## The final run

Our first attempt in the final run failed, and it wasn't the code. The robot's OptiTrack rigid body had been calibrated with the robot sitting at the start pose, so OptiTrack said it was facing 0° there, when it was actually facing −y. It was easy to miss because the robot looked like it was in the right place. Once we recalibrated with the robot facing +y, the heading matched and the run worked.

Our code doesn't care which way the course faces, but it does depend on the heading it's given being right.

<figure>
  <img src="/assets/rb2301_fp/real-course.png" alt="The mecanum robot driving between cardboard walls on the real course, with white cylinder obstacles in the foreground" loading="lazy" />
  <figcaption>The robot on the real course.</figcaption>
</figure>

## What's still missing

- **The narrow door.** When the padded path doesn't fit, A* falls back to the bare robot radius, which leaves almost no margin, and the robot can reach the door at an angle. Planning with the full rectangular footprint, and lining up square to the door before going through slowly, would be more reliable.
- **Touching obstacles.** The no-crash check uses the exact body with no padding and only looks 0.3 s ahead, so 1–2 cm of LiDAR noise on the real robot is enough for contact.
- **Waiting forever.** If a real panel only swings part-way, or noisy points make the gap jump around, neither go condition might hold. Estimating the panel's period, or just adding a timeout, would fix that.
- **Finding the front wall.** It needs 70% of S1's width to agree within 10 cm. With bent cardboard it might never be found, and then the door position is a guess.
- **Too many states.** Every real-course fix added states and constants, which slowed tuning down in the little lab time we had.

## What I took away

The biggest lesson was the gap between simulation and reality. The door detector worked every single time on Gazebo's perfectly straight walls and failed on bent cardboard. Now I try to build on things that survive real-world noise, and get onto the real course much earlier.

The final run taught me to check the inputs before blaming the algorithm. A simple check at start-up, like comparing the reported heading with the direction of the first walls the LiDAR sees, would have caught the calibration problem in seconds.

Simple beat complex again, in both halves. The panels needed one condition, not a trajectory prediction. The static part only became manageable after we cut it back to a few clear states, and even the final version is more complicated than I'd like.

I used Claude a lot on this project, to turn our decisions into code, explain ROS 2 and Gazebo behaviour, write the 2D harness, and read logs. It made writing code fast, but the code also grew fast. I learnt to ask for one small change at a time, test it, and only keep what I understood.
