---
title: "Obstacle Course Catapult Robot — Arduino UNO"
date: 2026-04-01
summary: "A three-wheeled robot that climbs over a bump and a ramp, stops just short of a wall, catapults a ping pong ball, and drives back."
fields: [hardware, electronics, software]
status: done
course: EG1311
---

<figure>
  <video src="/assets/eg1311/demo.mp4" controls playsinline preload="metadata"></video>
  <figcaption>Final demo. There's also a <a href="https://www.youtube.com/watch?v=tU9OoGDG4b8">5-minute video of the whole build</a> on YouTube.</figcaption>
</figure>

## The brief

This was our team project for EG1311, an engineering design-and-make module at NUS. Five of us had to build a self-powered robot that leaves the start area, gets over a 3 cm bump and a 10 cm ramp, stops just short of a wall, launches a ping pong ball, then comes back. The catch: it had to fit in 30 × 30 cm, run on limited power, and use only the materials we were given: cardboard, ice cream sticks, acrylic, polypropylene, anti-slip mat, rubber bands and tape. There was also a bonus point for the lightest robot.

<figure>
  <img src="/assets/eg1311/course.jpeg" alt="Side-view diagram of the course: 30 cm start area, a 3 cm bump, a 10 cm ramp, then a wall. Distances in cm." loading="lazy" />
  <figcaption>The obstacle course (all distances in cm).</figcaption>
</figure>

Before building anything, we agreed on a few rules for ourselves: keep the weight even and the centre of gravity low so it doesn't tip over, leave enough room around the wheels, and keep everything simple so it's easy to debug.

## Three motors, three wheels

The first big decision was to use only three motors: two to drive the wheels and one servo for the launcher. Fewer motors and wheels means less weight, and a lighter robot needs less power to get over obstacles. So we went with three wheels: two driven, one just for support. Fewer parts also meant fewer things that could break.

## The base: polypropylene over cardboard

Cardboard was the obvious first choice since it's easy to cut, but when we compared them, the cardboard pieces turned out heavier. Polypropylene was both lighter and stronger, so we cut a 16 × 14 cm sheet of it for the base.

Then we hit a problem: with a plain rectangle, there wasn't enough space for the wheels to turn. We cut two 5 × 2 cm notches out of the back to make room. We were worried this would weaken the base, so we glued ice cream sticks underneath to stiffen it.

<figure>
  <img src="/assets/eg1311/base.jpeg" alt="Black corrugated polypropylene base with two notches cut at the back, an Arduino UNO and a breadboard wired up on top" loading="lazy" />
  <figcaption>The polypropylene base, notches cut, electronics on.</figcaption>
</figure>

## Getting grip

Our first idea for the ramp was wheels with teeth around the edge that would hook into the surface and pull the robot up. In practice, the teeth didn't hook consistently. Sometimes they missed and the robot slipped or got stuck. So we switched to smooth laser-cut wheels, which were nice and light but had no grip at all: the robot couldn't get over the bump or up the ramp.

The fix was wrapping the wheels in anti-slip mat. We held off on this for a while because it added weight and we wanted that lightest-robot point. In the end we picked function over weight. Getting over the bump and the ramp was the whole point.

<figure>
  <div class="pair">
    <img src="/assets/eg1311/wheel-teeth-cad.jpeg" alt="CAD drawing of a wheel with teeth around the rim" loading="lazy" />
    <img src="/assets/eg1311/wheels-smooth.jpeg" alt="Four smooth black laser-cut wheels on a wooden table" loading="lazy" />
  </div>
  <figcaption>The toothed wheel in CAD (left) and the smooth laser-cut wheels (right).</figcaption>
</figure>

<figure class="yt">
  <iframe src="https://www.youtube-nocookie.com/embed/tU9OoGDG4b8?start=156&end=170&rel=0" title="Wheel testing, from the project video" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe>
  <figcaption>Wheels, from our project video. <a href="https://www.youtube.com/watch?v=tU9OoGDG4b8&t=156s">Watch the full video on YouTube</a>.</figcaption>
</figure>

## The catapult

For the cup that holds the ball, we sketched a cone and a cube. The cone could guide the ball as it launched, but the cube has a wider, flatter bottom, so it sits more firmly on the arm and wobbles less when the servo fires. We went with the cube.

Our first cube was cardboard, and it was too heavy. The ice cream sticks holding it up couldn't carry the weight, so the arm drooped and pulled the servo down before the robot was even switched on. We rebuilt it out of tape. It's still roughly a cube, just a much lighter one.

<figure>
  <div class="pair">
    <img src="/assets/eg1311/catapult-cone.jpeg" alt="A small paper cone" loading="lazy" />
    <img src="/assets/eg1311/catapult-cube.jpeg" alt="A small open paper box" loading="lazy" />
  </div>
  <figcaption>Cone (left) vs. cube (right).</figcaption>
</figure>

The arm itself was ice cream sticks cut in half (to save weight) and joined end to end. Version one was too long: it went past the 30 cm limit, and it was too heavy for the servo, so it kept falling off its single-slot mount and never launched anything.

Then the servos. The first one buzzed nonstop, which we figured was an internal fault. The second one didn't respond at all, even though our code was right. After ruling out the code and the wiring, we decided both were broken and got a fresh one from the lab. That one finally worked.

One last catapult lesson: we'd used a rubber band to hold the arm on the servo, thinking it would make it sturdier. It actually pulled the arm down and changed its resting angle, which threw off the launch. Taking the rubber band off made the launches much more consistent.

<figure class="yt">
  <iframe src="https://www.youtube-nocookie.com/embed/tU9OoGDG4b8?start=188&end=200&rel=0" title="Catapult testing, from the project video" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe>
  <figcaption>Catapult testing, from our project video. <a href="https://www.youtube.com/watch?v=tU9OoGDG4b8&t=188s">Watch the full video on YouTube</a>.</figcaption>
</figure>

## The code

The program is a simple state machine with four states: approach, fire, reverse, done. An ultrasonic sensor at the front measures the distance to the wall, averaging a few readings to smooth out noise. The robot drives fast, slows down within 25 cm of the wall, stops at 7.5 cm, fires the catapult, then reverses until it's back near the start (or until a 9-second timeout, just in case).

```cpp
switch (state) {
  case APPROACH:
    if (distance > 0 && distance <= STOP_DISTANCE_CM) { stopMotors(); state = FIRE; }
    else if (distance > 0 && distance <= SLOW_DISTANCE_CM) moveForward(SLOW_SPEED);
    else moveForward(FAST_SPEED);
    break;
  case FIRE:
    stopMotors();
    fireCatapult();
    state = REVERSE;
    break;
  // REVERSE: back up until far enough from the wall, then DONE
}
```

It didn't start out this clean. Our first version also tried to control and fine-tune the speed, and it got so complicated we couldn't tell where the bugs were. We cut it back to the bare minimum and got the robot moving reliably first.

The most annoying bug wasn't in the logic at all: the pin numbers in the code didn't match the pins the wires were actually plugged into. We spent ages assuming the motors or the wiring were broken. Lesson learnt: when a robot misbehaves, check the code and the hardware together.

## Why it kept drifting right

Once everything was assembled, the robot kept drifting right instead of going straight. We didn't think much of it at first. Then, on the ramp, it made it up fine but went off course on the way back. The motors were running correctly, so it wasn't the code: one motor had been hot-glued on slightly crooked.

Getting it off was harder than expected. Scraping the glue off with a penknife and scissors got us nowhere. After some googling, we found that a hair dryer softens hot glue enough to pull it apart. We realigned the motor, glued it back, tested, and repeated a few times until it drove straight. Meanwhile, loose jumper wires kept popping out, and more than once we forgot where they went and panicked a little.

<figure>
  <div class="pair">
    <img src="/assets/eg1311/motor-tilted.jpeg" alt="Back view of the robot with the right wheel visibly tilted" loading="lazy" />
    <img src="/assets/eg1311/motor-removed.jpeg" alt="The robot with one motor removed, being held for readjustment" loading="lazy" />
  </div>
  <figcaption>The tilted right wheel (left) and the motor off for realignment (right).</figcaption>
</figure>

## Competition day

By lab session 4 the robot moved reliably and the catapult launched, but it fired before the robot had finished its approach. On competition day, we found out the robot had to stop within a 5 cm zone, and ours wasn't. So we changed the fire distance in the code right there, nervous the whole time that we'd break something else.

The day also showed us how unpredictable hardware can be. On our second run, the back wheels just stopped turning on the way back, something we'd never really seen in practice. Another time, the robot crawled and struggled up the ramp, and it turned out the batteries were simply running flat.

<figure class="yt">
  <iframe src="https://www.youtube-nocookie.com/embed/tU9OoGDG4b8?start=220&end=250&rel=0" title="Runs on the course, from the project video" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe>
  <figcaption>Runs on the course, from our project video. <a href="https://www.youtube.com/watch?v=tU9OoGDG4b8&t=220s">Watch the full video on YouTube</a>.</figcaption>
</figure>

<figure>
  <img src="/assets/eg1311/final.jpeg" alt="The finished robot at the start line: three wheels, a polypropylene base, an ice cream stick arm and a tape cup holding the ball" loading="lazy" />
  <figcaption>The final robot.</figcaption>
</figure>

<figure>
  <div class="pair">
    <img src="/assets/eg1311/cad-front.jpeg" alt="CAD render of the robot from the front" loading="lazy" />
    <img src="/assets/eg1311/cad-side.jpeg" alt="CAD render of the robot from the side" loading="lazy" />
  </div>
  <figcaption>CAD model, front and side.</figcaption>
</figure>

## What I took away

This project wasn't about one clever idea. It was about grinding through a long list of small problems: the wrong material, wheels with no grip, broken servos, mismatched pins, a crooked motor, flat batteries. Almost every time, what looked like the problem wasn't the real one, so the most useful habit was to check our assumptions before jumping to a fix. It also taught me how much a team matters when things go wrong at the worst possible moment: staying calm and changing the code on competition day was a group effort.
