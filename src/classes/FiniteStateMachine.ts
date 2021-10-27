import { IReadOnlySignal, ISignal } from "@rbxts/signals-tooling";
import { SignalFactory } from "factories/SignalFactory";

function convertTupleKeysToNestedMap<K1, K2, V>(
	tupleKeysMap: ReadonlyMap<[K1, K2], V>,
): ReadonlyMap<K1, ReadonlyMap<K2, V>> {
	const tupleKeysLookUpMap = new Map<K1, Map<K2, V>>();

	for (const [tupleKey, value] of tupleKeysMap) {
		if (!tupleKeysLookUpMap.has(tupleKey[0])) {
			tupleKeysLookUpMap.set(tupleKey[0], new Map());
		}

		tupleKeysLookUpMap.get(tupleKey[0])!.set(tupleKey[1], value);
	}

	return tupleKeysLookUpMap;
}

export class FiniteStateMachine<StateType extends defined, EventType extends defined> {
	public readonly stateChanged: IReadOnlySignal<(newState: StateType, oldState: StateType, event: EventType) => void>;

	private readonly stateChangedFireable: ISignal<
		(newState: StateType, oldState: StateType, event: EventType) => void
	>;
	private readonly stateTransitions: ReadonlyMap<StateType, ReadonlyMap<EventType, StateType>>;

	private constructor(
		private currentState: StateType,
		signalFactory: SignalFactory,
		tupleKeyStateTransitions: ReadonlyMap<[StateType, EventType], StateType>,
	) {
		this.stateTransitions = convertTupleKeysToNestedMap(tupleKeyStateTransitions);

		this.stateChangedFireable = signalFactory.createInstance();
		this.stateChanged = this.stateChangedFireable;
	}

	public static create<StateType, EventType>(
		initialState: StateType,
		stateTransitions: ReadonlyMap<[StateType, EventType], StateType>,
	) {
		return new FiniteStateMachine(initialState, new SignalFactory(), stateTransitions);
	}

	public getCurrentState(): StateType {
		return this.currentState;
	}

	public handleEvent(event: EventType) {
		const newState = this.stateTransitions.get(this.currentState)?.get(event);
		if (newState === undefined) {
			throw `Invalid event '${event}' while in state '${this.currentState}'`;
		}

		const oldState = this.currentState;
		this.currentState = newState;

		this.stateChangedFireable.fire(newState, oldState, event);
	}
}
