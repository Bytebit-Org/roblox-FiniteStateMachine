/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/// <reference types="@rbxts/testez/globals" />

import fitumi from "@rbxts/fitumi";
import { a } from "@rbxts/fitumi";
import { SignalFactory } from "factories/SignalFactory";
import { FiniteStateMachine } from "./FiniteStateMachine";

type StateType = "A" | "B" | "C";
type EventType = "A-B" | "A-C" | "B-C" | "C-A" | "Loop";

const ALL_STATES: ReadonlyArray<StateType> = ["A", "B", "C"];

const DEFAULT_STATE_TRANSITIONS: ReadonlyMap<[StateType, EventType], StateType> = new Map([
	[["A", "A-B"], "B"],
	[["A", "A-C"], "C"],
	[["A", "Loop"], "A"],
	[["B", "B-C"], "C"],
	[["B", "Loop"], "B"],
	[["C", "C-A"], "A"],
	[["C", "Loop"], "C"],
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

	describe("getCurrentState", () => {
		// testing getCurrentState is sort of impossible to do alone
		// and if it isn't working, then all the other tests are going to fail anyway
	});

	describe("handleEvent", () => {
		it("should properly update state and fire stateChanged when given an event with a valid transition from the current state", () => {
			for (const [[startState, event], newState] of DEFAULT_STATE_TRANSITIONS) {
				const fsm = new UnitTestableFiniteStateMachine({
					currentState: startState,
				});

				expect(fsm.getCurrentState()).to.equal(startState);

				let eventArgsTuple: [StateType, StateType, EventType] | undefined = undefined;
				fsm.stateChanged.Connect((newState, oldState, event) => {
					expect(eventArgsTuple).never.to.be.ok();

					eventArgsTuple = [newState, oldState, event];
				});

				fsm.handleEvent(event);

				expect(fsm.getCurrentState()).to.equal(newState);
				expect(eventArgsTuple).to.be.ok();
				expect(eventArgsTuple![0]).to.equal(newState);
				expect(eventArgsTuple![1]).to.equal(startState);
				expect(eventArgsTuple![2]).to.equal(event);
			}
		});

		it("should throw when given an invalid event for the current state", () => {
			const fsm = new UnitTestableFiniteStateMachine({
				currentState: "B",
			});

			expect(() => fsm.handleEvent("A-C")).to.throw();
		});
	});
};
