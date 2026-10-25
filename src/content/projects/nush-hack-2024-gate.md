---
title: "Anti-Tailgating Condo Gate — Arduino UNO"
date: 2024-11-09
summary: "A cardboard condo gate that notices when a second person slips through behind someone and raises the alarm. 3rd place at NUSH Hack 2024."
fields: [electronics, hardware]
status: done
course: NUSH Hackathon 2024
---

<figure>
  <video src="/assets/nushhack_nov24/demo.mp4" controls playsinline preload="metadata"></video>
  <figcaption>Demo: touching the handle and opening the gate.</figcaption>
</figure>

## Third time back

This was my third year at the NUSH Hackathon. Two years earlier, I'd shown up knowing nothing about coding, electronics or hardware. This time, our team placed third. After three years of learning from zero, that felt really good.

It was also our most practical project. Instead of a quirky automation idea, we went after a real, everyday security problem.

<figure>
  <img src="/assets/nushhack_nov24/award.jpg" alt="A printed certificate in a plastic sleeve reading 3rd Place, NUSH Hack 2024: Pepper Category" loading="lazy" />
  <figcaption>3rd place, NUSH Hack 2024.</figcaption>
</figure>

## The problem: tailgating

Most condos in Singapore have gates that only open for residents. But a gate can't tell how many people walk through once it's open. Someone without access can simply follow a resident in. That's called tailgating, and it defeats the whole point of the gate.

## How it works

Our gate pays attention to what happens after it's opened:

- **The handle** has a sensor that detects a hand touching it, so the gate knows when someone is opening it.
- **An ultrasonic sensor** on the side of the doorway watches for people passing through.
- **Timing ties it together.** When the handle is touched, the gate expects one person to walk through. If the sensors pick up another person, or the handle is touched again before the gate has closed, it treats that as tailgating and sounds the alarm.
- **An LCD screen and a joystick** on the base show the gate's status and let you control it.

<figure>
  <img src="/assets/nushhack_nov24/annotated.jpg" alt="The cardboard gate opened up, with the sensors circled in red: wires at the top of the frame, an ultrasonic sensor on the side, a servo inside the frame, an LCD screen and a joystick on the base, and a touch sensor on the handle" loading="lazy" />
  <figcaption>Where everything sits: sensors on the frame and handle, the servo inside, and the LCD and joystick on the base.</figcaption>
</figure>

For the handle, we used a water-level sensor. It's meant for detecting water, but its exposed metal strips also react to the touch of a hand, which made it a cheap and simple touch sensor.

## The build

This was the neatest and sturdiest prototype I've made at a hackathon. The frame is double and triple layers of cardboard, so it stands up straight and the door swings properly instead of sagging. The electronics are hidden inside the base, with only the screen and the joystick showing.

<figure>
  <div class="pair">
    <img src="/assets/nushhack_nov24/gate-closed.jpg" alt="The finished gate closed, with the touch-sensor handle on the door and the LCD and joystick on the base" loading="lazy" />
    <img src="/assets/nushhack_nov24/gate-open.jpg" alt="The gate with its door swung open, showing the sensors on the inside of the frame" loading="lazy" />
  </div>
  <figcaption>The gate closed (left) and open (right).</figcaption>
</figure>

<figure>
  <img src="/assets/nushhack_nov24/build.jpg" alt="The gate frame on a desk mid-build, with a teammate holding the door panel" loading="lazy" />
  <figcaption>Putting it together.</figcaption>
</figure>

## What I took away

It's the least flashy project I've done at a hackathon, and probably the most useful. A small, realistic idea that works well on the day beats an ambitious one that only half works. Looking back over three years, I could see how much I'd grown: from knowing nothing about hardware, to building a clean, steady prototype that actually placed.
