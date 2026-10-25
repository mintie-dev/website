---
title: "Autonomous Duster — Arduino UNO"
date: 2023-11-10
summary: "An autonomous duster that avoids obstacles, finds the shelf height, raises the duster to match, and sweeps the shelf."
fields: [electronics, hardware]
status: done
course: NUSH Hackathon 2023
---

<figure>
  <video src="/assets/nushhack_10nov23/final_demo.MP4" controls playsinline preload="metadata"></video>
  <figcaption>Final demo.</figcaption>
</figure>

## Back for round two

This was my second year at the NUSH Hackathon, and I came back with one goal: build something nobody else in the room would think of. Every team got an Arduino UNO, some cardboard, and the same small kit of parts: wheels, LEDs, sensors and motors. This year's theme was "Automate a Daily Task".

I picked dusting. I hate dusting! The robot had to:

- drive up to a shelf while avoiding obstacles
- bring the duster to the right height
- sweep left and right

<figure>
  <img src="/assets/nushhack_10nov23/sketch.jpeg" alt="Pencil sketch of the duster robot, with the pulley and shelf heights marked in red and blue" loading="lazy" />
  <figcaption>The first sketch.</figcaption>
</figure>

## The problem: moving up and down

To dust a shelf, the duster has to go up and down. But nothing in the kit was built for vertical motion: no linear actuator, no lead screw, no rack and pinion. We only had two kinds of motors: the SG90 micro servo, small and precise, and the TT gear motor, a DC motor made for driving wheels.

<figure>
  <div class="pair">
    <img src="/assets/nushhack_10nov23/SG90-Micro-Servo-Motor.png" alt="SG90 micro servo" loading="lazy" />
    <img src="/assets/nushhack_10nov23/TT-gear-motor.png" alt="TT gear motor" loading="lazy" />
  </div>
  <figcaption>SG90 micro servo (left) and TT gear motor (right).</figcaption>
</figure>

A pulley system came to mind pretty naturally, but building it was not smooth sailing! I used two wheels as the winch, each winding a coil of fishing line. On the other end I fixed a pencil, so the line could run over it with minimal friction. The front lines go down through a platform that later holds the paper duster. To keep the back lines out of the way, I threaded them through two straws.

<!-- TODO: annotated photo of the pulley -->

<figure>
  <video src="/assets/nushhack_10nov23/fish_line_demo.MP4" controls playsinline preload="metadata"></video>
  <figcaption>Testing the pulley. The base is upside down here; in the final build the wheels sit at the bottom, hidden in a case with the rest of the electronics.</figcaption>
</figure>

Each wheel is about 6.5 cm in diameter, so one full turn winds in about π × 6.5 ≈ 20.4 cm of line.

Nobody else in the room was using the wheels this way, and this pulley is the part of the project I'm proudest of.

## Getting the tension right

Coming up with the idea was one thing. Making it work was another, and it took most of the night. The line had to be tight enough not to slip or go slack on the wheel, but loose enough to wind and unwind smoothly. The duster platform had to hang level and stay attached the whole way up and down. My teammate and I stayed up through the night building the hardware and writing the code, and we went through a lot of tape and a lot of snacks.

<figure>
  <img src="/assets/nushhack_10nov23/process.jpeg" alt="Cardboard frame, wheels, an Arduino and wires spread on the floor mid-build, with snacks and tape around" loading="lazy" />
  <figcaption>Mid-build.</figcaption>
</figure>

## Two degrees of freedom

With up and down solved, the servo took care of sweeping. It's precise, which made it the right motor for swinging the duster left and right across the shelf. Together, the pulley and the servo gave the duster two degrees of freedom: up and down to reach the shelf, side to side to clean it.

The base holds everything else: two drive wheels, ultrasonic sensors at the front, the Arduino UNO, a motor driver, and an 18650 battery pack taped to the side. Even for a hackathon, I took pride in hiding the electronics.

## The code

Compared with the hardware, the code was the easy part. The ultrasonic sensors let the robot read its surroundings, and the program runs through the task in order: avoid obstacles, work out the shelf height, move the duster to that height, then sweep.

<figure>
  <img src="/assets/nushhack_10nov23/final.jpeg" alt="The finished cardboard duster robot with a paper duster hanging inside its frame and ultrasonic sensors at the front" loading="lazy" />
  <figcaption>The finished duster.</figcaption>
</figure>

## What I took away

This was one of my favorite projects to work on. It taught me to see parts for what they can do, not just what their labels say. A wheel's real job is grip, and grip is exactly what a winch needs. Every team had the same kit; we just looked at it differently. That little cardboard prototype still has a dear place in my heart.
