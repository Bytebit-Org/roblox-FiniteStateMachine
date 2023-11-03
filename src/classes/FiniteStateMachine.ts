import { Bin } from "@rbxts/bin";
import { IReadOnlySignal, ISignal } from "@rbxts/signals-tooling";
import { SignalFactory } from "factories/SignalFactory";
import { IReadonlyFiniteStateMachine } from "interfaces/IReadonlyFiniteStateMachine";

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

export class FiniteStateMachine<StateType extends defined, EventType extends defined>
	implements IReadonlyFiniteStateMachine<StateType, EventType>
{
	public readonly stateChanged: IReadOnlySignal<(newState: StateType, oldState: StateType, event: EventType) => void>;

	private readonly bin: Bin;
	private isDestroyed = false;
	private readonly stateChangedFireable: ISignal<
		(newState: StateType, oldState: StateType, event: EventType) => void
	>;
	private readonly stateTransitions: ReadonlyMap<StateType, ReadonlyMap<EventType, StateType>>;

	protected constructor(
		private currentState: StateType,
		signalFactory: SignalFactory,
		tupleKeyStateTransitions: ReadonlyMap<[StateType, EventType], StateType>,
	) {
		this.bin = new Bin();
		this.stateTransitions = convertTupleKeysToNestedMap(tupleKeyStateTransitions);

		this.stateChangedFireable = signalFactory.createInstance();
		this.stateChanged = this.stateChangedFireable;

		this.bin.add(this.stateChangedFireable);
		this.bin.add(() => (this.isDestroyed = true));
	}

	public static create<StateType extends defined, EventType extends defined>(
		initialState: StateType,
		stateTransitions: ReadonlyMap<[StateType, EventType], StateType>,
	) {
		return new FiniteStateMachine(initialState, new SignalFactory(), stateTransitions);
	}

	public destroy() {
		if (this.isDestroyed) {
			warn(debug.traceback(`Attempt to destroy an already destroyed instance of type "${getmetatable(this)}"`));
		}

		this.bin.destroy();
	}

	public getCurrentState(): StateType {
		this.assertIsNotDestroyed();

		return this.currentState;
	}

	public handleEvent(event: EventType) {
		this.assertIsNotDestroyed();

		const newState = this.stateTransitions.get(this.currentState)?.get(event);
		if (newState === undefined) {
			throw `Invalid event '${event}' while in state '${this.currentState}'`;
		}

		const oldState = this.currentState;
		this.currentState = newState;

		this.stateChangedFireable.fire(newState, oldState, event);
	}

	private assertIsNotDestroyed() {
		if (this.isDestroyed) {
			throw `Attempt to call a method on an already destroyed instance of type "${getmetatable(this)}"`;
		}
	}
}
