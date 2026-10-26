---
title: "ECCOSORB Infrared Filter for Quantum Circuits"
date: 2023-12-01
summary: "Designing and hand-building a filter that blocks high-frequency noise before it reaches a quantum computer's qubits, while letting the 4–8 GHz control signals through."
fields: [hardware]
status: done
course: Centre for Quantum Technologies, NUS
---

<figure>
  <img src="/assets/cqt_eccosorb/final.jpg" alt="The finished ECCOSORB filter: a small copper block with gold SMA connectors on each end, black epoxy filling the hole on top, and six screw holes" loading="lazy" />
  <figcaption>The finished filter.</figcaption>
</figure>

## The problem: qubits are fragile

This was a research project at the Centre for Quantum Technologies (CQT) at NUS, done with a partner.

Quantum computers can solve certain problems, like simulating how molecules behave, far faster than normal computers. Their basic unit is the qubit. Qubits are extremely sensitive: any stray noise from the environment, like infrared radiation, can knock them out of their quantum state (called decoherence) and ruin the measurement. So quantum computers are wrapped in layer after layer of isolation.

One of those layers is a filter on the cables that carry control signals to the qubits. The qubits are controlled with microwave signals between **4 and 8 GHz**. Other parts of the circuit already block frequencies below that range. The job of our filter was to block everything **above** it, while letting 4–8 GHz through with as little loss as possible.

## What an ECCOSORB is

An ECCOSORB filter is basically a short section of coaxial cable. A coax cable has an inner conductor, an outer conductor, and an insulating material (the dielectric) in between, which keeps the signal inside and outside interference out.

In an ECCOSORB, the dielectric is a special black epoxy that absorbs high-frequency radiation, and the outer conductor is a copper body. You can buy these filters, but making them in the lab is cheaper and faster, and you can adapt the design to fit your own setup.

<figure>
  <img src="/assets/cqt_eccosorb/coax-diagram.png" alt="Cross-section of a coaxial cable: a small inner conductor of radius a, surrounded by dielectric, inside an outer conductor of radius b" loading="lazy" />
  <figcaption>A coax cable in cross-section. In our filter, the dielectric is absorbing epoxy.</figcaption>
</figure>

We suspected two things had hurt earlier prototypes in the lab. One was sloppy soldering: too little solder makes a weak connection that loses signal, while too much takes up space the epoxy should fill. The other was air bubbles trapped in the epoxy, which reduce how much it absorbs. So the goal was to build a cleaner, more reliable manufacturing process.

## Building it

### 1. Designing the copper body

We modelled the copper body in Autodesk Inventor, starting from our mentor's earlier prototypes. Compared with the filters you can buy, we made three changes:

- a **cuboid** instead of a cylinder, so it sits flat
- **six M2 screw holes**, so it can be mounted onto the lab's copper brackets
- an **opening on top** to inject the epoxy

The design was then sent to another lab to be machined.

<figure>
  <img src="/assets/cqt_eccosorb/cad.png" alt="CAD model of the copper body: a cuboid with a large hole on top, six small screw holes around it, and a hole through the side for the connectors" loading="lazy" />
  <figcaption>The copper body in Inventor.</figcaption>
</figure>

### 2. Press-fitting the connectors

The SMA connectors at each end need to fit tightly into the copper body. Full contact means better thermal conduction, which helps the filter shed heat. We used a vice to press them in evenly.

On our first tries, the vice pressed too hard and deformed the connectors, so they couldn't be screwed onto anymore. The fix was simple: screw a cap onto each connector before pressing. The cap protected the thread, and its bigger surface spread the force more evenly, so far more of them came out undamaged.

<figure>
  <img src="/assets/cqt_eccosorb/press-fit.jpg" alt="The copper body clamped in a metal vice between two aluminium blocks, with a connector being pressed in" loading="lazy" />
  <figcaption>Press-fitting a connector in the vice.</figcaption>
</figure>

### 3. Soldering

Next, the pins of the two connectors are soldered together inside the body. What worked best: a dull soldering tip, a tiny amount of solder, holding it on the gap for about five seconds, then checking the connection. Good lighting and a magnifier help a lot at this size.

<figure>
  <div class="pair">
    <img src="/assets/cqt_eccosorb/soldering.jpg" alt="Soldering the connector pins through the top opening of the copper body" loading="lazy" />
    <img src="/assets/cqt_eccosorb/soldered.jpg" alt="Top view of the copper body with the soldered pin visible through the opening and screws in the mounting holes" loading="lazy" />
  </div>
  <figcaption>Soldering the pins (left) and the joint inside the body (right).</figcaption>
</figure>

### 4. Mixing and pouring the epoxy

The epoxy (Eccosorb CR-110) comes in two parts, mixed 100:12 by weight. We mixed them, preheated the mixture at 65 °C for 20 minutes, then put it in a vacuum chamber in the lab's clean room for five minutes to pull out any trapped air bubbles. A few more minutes on the hot plate made it runny enough to pour again.

<figure>
  <div class="pair">
    <img src="/assets/cqt_eccosorb/epoxy-part-a.jpg" alt="Scooping part A of the epoxy from a tin onto a glass dish" loading="lazy" />
    <img src="/assets/cqt_eccosorb/epoxy-part-b.jpg" alt="Adding part B of the epoxy to a glass dish with a dropper" loading="lazy" />
  </div>
  <div class="pair">
    <img src="/assets/cqt_eccosorb/epoxy-vacuum.jpg" alt="The black epoxy mixture in a glass dish after degassing" loading="lazy" />
    <img src="/assets/cqt_eccosorb/epoxy-hotplate.jpg" alt="The epoxy dish warming on a hot plate" loading="lazy" />
  </div>
  <figcaption>Weighing out both parts, degassing, and warming the mixture.</figcaption>
</figure>

To fill the filter, we first plugged the six screw holes with M2 screws so no epoxy could leak into them. Then we dripped the epoxy in through the top opening and poked it with a thin wire to release any last trapped air, so it filled the whole cavity. After wiping off the excess, the filter went back on the hot plate to cure (for example, 12 hours at 74 °C, or 1 hour at 149 °C).

Filling from the top, instead of from the side like the filters we based ours on, was one of the main changes in our process.

<figure>
  <img src="/assets/cqt_eccosorb/filling.jpg" alt="Using a thin wire to work epoxy into the top opening of the filter, with screws plugging the mounting holes" loading="lazy" />
  <figcaption>Working out trapped air with a thin wire.</figcaption>
</figure>

## Testing it

We measured the finished filter with a vector network analyser (VNA), which sends signals through the filter from 10 MHz to 20 GHz and measures how much gets through (transmission) and how much bounces back (reflection).

- **Transmission** drops steadily as frequency goes up, so higher frequencies are blocked more.
- **Reflection** stays low across our 4–8 GHz operating range and below, and only rises above −15 dB from around 9 GHz. There's an odd spike at about 13 GHz, likely from an imperfect cable or the test setup.

In short: little loss and little reflection at 4–8 GHz, which is exactly what the qubits need, and stronger blocking at higher frequencies.

<figure>
  <a href="/assets/cqt_eccosorb/vna.png"><img src="/assets/cqt_eccosorb/vna.png" alt="Four VNA plots from 10 MHz to 20 GHz: reflection at port 1 and port 2, and transmission in each direction, which slopes gently downward with frequency" loading="lazy" /></a>
  <figcaption>VNA measurements: reflection (top left, bottom right) and transmission (top right, bottom left), 10 MHz to 20 GHz (click to enlarge).</figcaption>
</figure>

## What I took away

We ended up with a working prototype and, more importantly, a validated process for making these filters in the lab using mostly materials and tools that were already there. That makes them cheaper and quicker to produce for any future quantum experiments.

It also showed me how much the small, careful steps matter in lab work. A cap on a connector, five seconds of solder, five minutes in a vacuum chamber: none of these feel like the "real" engineering, but each one decided whether the filter worked.
