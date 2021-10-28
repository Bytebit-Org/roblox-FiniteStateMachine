/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/// <reference types="@rbxts/testez/globals" />

import fitumi from "@rbxts/fitumi";
import { a } from "@rbxts/fitumi";
import { SignalFactory } from "factories/SignalFactory";
import { FiniteStateMachine } from "./FiniteStateMachine";

type StateType = "A" | "B" | "C";
type EventType = "A-B" | "A-C" | "B-C" | "C-A";

const ALL_STATES: ReadonlyArray<StateType> = ["A", "B", "C"];

const DEFAULT_STATE_TRANSITIONS = new Map<[StateType, EventType], StateType>([
	[["A", "A-B"], "B"],
	[["A", "A-C"], "C"],
	[["B", "B-C"], "C"],
	[["A", "C-A"], "A"],
]);

class UnitTestableFiniteStateMachine extends FiniteStateMachine<StateType, EventType> {
	public constructor(
		args?: Partial<{
			currentState: StateType;
			signalFactory: SignalFactory;
			tupleKeyStateTransitions: ReadonlyMap<[StateType, EventType], StateType>;
		}>,
	) {
		super(
			args?.currentState ?? "A",
			args?.signalFactory ?? new SignalFactory(),
			args?.tupleKeyStateTransitions ?? DEFAULT_STATE_TRANSITIONS,
		);
	}
}

export = () => {
	describe("initialState", () => {
		it("should reflect whatever it is given at initialization", () => {
			for (const state of ALL_STATES) {
				const fsm = new UnitTestableFiniteStateMachine({
					currentState: state,
				});

				expect(fsm.getCurrentState()).to.equal(state);
			}
		});
	});
};
