# Finite State Machine
<p align="center">
	<a href="https://github.com/Bytebit-Org/roblox-FiniteStateMachine/actions">
        <img src="https://github.com/Bytebit-Org/roblox-FiniteStateMachine/workflows/CI/badge.svg" alt="CI status" />
    </a>
	<a href="http://makeapullrequest.com">
		<img src="https://img.shields.io/badge/PRs-welcome-blue.svg" alt="PRs Welcome" />
	</a>
	<a href="https://opensource.org/licenses/MIT">
		<img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" />
	</a>
	<a href="https://discord.gg/QEz3v8y">
		<img src="https://img.shields.io/badge/discord-join-7289DA.svg?logo=discord&longCache=true&style=flat" alt="Discord server" />
	</a>
</p>

A simple Finite State Machine implementation for Roblox development written using roblox-ts.

## Installation
### roblox-ts
Simply install to your [roblox-ts](https://roblox-ts.com/) project as follows:
```
npm i @rbxts/finite-state-machine
```

### Wally
[Wally](https://github.com/UpliftGames/wally/) users can install this package by adding the following line to their `Wally.toml` under `[dependencies]`:
```
FiniteStateMachine = "bytebit/finite-state-machine@1.0.9"
```

Then just run `wally install`.

### From model file
Model files are uploaded to every release as `.rbxmx` files. You can download the file from the [Releases page](https://github.com/Bytebit-Org/roblox-FiniteStateMachine/releases) and load it into your project however you see fit.

### From model asset
New versions of the asset are uploaded with every release. The asset can be added to your Roblox Inventory and then inserted into your Place via Toolbox by getting it [here.](https://www.roblox.com/library/7872552904/Finite-State-Machine-Package)

## Documentation

### IReadonlyFiniteStateMachine interface
This interface is meant to be used when there is a consumer that merely cares about the state of the machine but not to do anything to affect that state.

It requires two generic inputs - a `StateType` and an `EventType`. Both must simply fit the type `defined`.

#### stateChanged Signal
`readonly stateChanged: IReadOnlySignal<(newState: StateType, oldState: StateType, event: EventType) => void>;`

Fired when the current state is changed by an event.

#### getCurrentState Method
`getCurrentState(): StateType;`

Used to get the current state of the machine.

### FiniteStateMachine class

_Implements everything from `IReadonlyFiniteStateMachine`._

This is the root of this package.

#### Construction
In order to construct a `FiniteStateMachine` instance, you will need to define your states, events, and the transition relationships between them.

Take this on/off switch as an example:
```ts
type StateType = "On" | "Off";
type EventType = "Toggle";
const stateTransitions = new Map<[StateType, EventType], StateType>([
	[["Off", "Toggle"], "On"],
	[["On", "Toggle"], "Off"]
]);
const fsm = FiniteStateMachine.create("Off", stateTransitions);
```

#### destroy Method
`destroy(): void`

This method is used to destroy an instance. That instance will throw exceptions if any other methods are used after this is invoked.

#### handleEvent Method
`handleEvent(event: EventType): void`

This method is used to effect a state transition though an event. If the given event has a valid state to transition to from the current state as per the state transitions at the time of the instance's construction, the state will be changed accordingly; otherwise, an error will be raised.

Example using the on/off switch from above:
```ts
function toggleSwitch() {
	fsm.handleEvent("Toggle");
}
```
