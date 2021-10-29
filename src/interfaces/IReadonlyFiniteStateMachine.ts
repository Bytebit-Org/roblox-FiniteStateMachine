import { IReadOnlySignal } from "@rbxts/signals-tooling";

export interface IReadonlyFiniteStateMachineFiniteStateMachine<StateType extends defined, EventType extends defined> {
	/** Fired when the current state is changed by an event */
	readonly stateChanged: IReadOnlySignal<(newState: StateType, oldState: StateType, event: EventType) => void>;

	/** Gets the current state */
	getCurrentState(): StateType;
}
