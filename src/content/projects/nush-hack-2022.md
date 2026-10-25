---
title: "Self-Cleaning Hamster Cage — Arduino UNO"
date: 2022-11-12
summary: "A hamster cage whose floor rolls away like a garage door, so the old bedding drops through a grid while the hamster stays safe on top. Plus a cardboard feeder arm that extends and retracts."
fields: [electronics, hardware]
status: done
course: NUSH Hackathon 2022
---

<figure>
  <img src="/assets/nushhack_nov22/final.jpg" alt="The finished cardboard cage prototype held up in front of the Design Studio window, with the feeder arm on the right and the electronics underneath" loading="lazy" />
  <figcaption>The finished prototype.</figcaption>
</figure>

## Where it started

This was my first hackathon ever, and my first time doing anything with robotics, electronics or hardware. I didn't know how to code. I didn't know what an Arduino was. A few days before the competition, I emailed the organisers to ask if they could send me some material to read, because I genuinely had no idea what I was walking into. I still came anyway.

There was no theme that year, so I asked myself: what annoying task in my own life could I automate?

## The problem: hamster bedding

I used to have a pet hamster. If you've never had one: there's no separate litter box like a cat's. The bedding covering the whole cage floor *is* the litter box. So every week you have to take the hamster out, take everything else out too (the wheel, the bed, the food bowl, the water bottle), pour all the old bedding away, put new bedding in, and move everything back. It's a whole chore.

## The idea: a floor that rolls away

My first idea was a metal mesh, like a grill, lying under the bedding. When it's time to clean, the mesh lifts straight up. Anything big (the hamster, its wheel, its bowl) gets carried up with it, and the bedding, being small, falls through the gaps into a tray underneath. Pull the tray out, empty it, and you're done.

Then I thought: why move the grid at all? Keep the grid fixed and make the *floor* move instead. For that I borrowed the idea of a roll-up garage door. The floor is a flexible sheet that rolls away when it's cleaning time. The grid sits on top of it. Once the floor rolls away, there's nothing under the grid, so the bedding drops through into the tray while the hamster, which is much bigger than the gaps, stays safe on top.

Taking a mechanism from something completely unrelated, like a garage door, and putting it in a hamster cage is still the part of this project I'm proudest of.

<figure>
  <img src="/assets/nushhack_nov22/prototype.jpg" alt="The cardboard cage on a workbench with the rolled-up floor at the front, the feeder arm on the side, and an Arduino, breadboard and LCD wired up below" loading="lazy" />
  <figcaption>The prototype mid-build. The rolled-up tube at the front is the floor.</figcaption>
</figure>

## Building it out of cardboard

Everything was cardboard, tape and string. The cage is a cardboard box, and the roll-up floor is a sheet of cardboard that rolls into a tube at the front. The electronics sit on the side: an Arduino UNO, a breadboard and an LCD screen, all taped down with a lot of masking tape.

<figure>
  <img src="/assets/nushhack_nov22/electronics.jpg" alt="Close-up of an Arduino UNO taped to the side of the cardboard box, wired to a breadboard and a green LCD screen" loading="lazy" />
  <figcaption>The electronics: Arduino UNO, breadboard and LCD.</figcaption>
</figure>

## The feeder arm

We also added an automatic feeder on the side of the cage: an arm that extends out and retracts again. It's made of cardboard tubes that slide inside each other, pulled by elastic bands and string, with a servo to release it.

<figure>
  <div class="pair">
    <video src="/assets/nushhack_nov22/clip-1.mp4" autoplay muted loop playsinline preload="metadata"></video>
    <img src="/assets/nushhack_nov22/feeder-arm.jpg" alt="The cardboard feeder arm, taped to the side of the cage, with an ultrasonic sensor at the top" loading="lazy" />
  </div>
  <figcaption>The nested cardboard tubes of the feeder arm (left) and the arm mounted on the cage (right).</figcaption>
</figure>

<figure>
  <video src="/assets/nushhack_nov22/clip-2.mp4" controls playsinline preload="metadata"></video>
  <figcaption>Testing the feeder arm on the prototype.</figcaption>
</figure>

I'm sad I don't have a proper video of the whole thing working, but those clips give a bit of a feel for it.

## What I took away

Looking back, the project was too ambitious for 24 hours. We had two big ideas, the bedding system and the feeder, and only time to do one of them properly.

The feeder didn't add much value, but it ate a lot of our time. Getting cardboard tubes to extend and retract smoothly was really hard, and debugging it pulled us away from the bedding system, which was the whole point of the project.

So the biggest lesson from my first hackathon: time and priorities matter a lot. Pick the one idea that matters most, make it work, and only then add extras.
