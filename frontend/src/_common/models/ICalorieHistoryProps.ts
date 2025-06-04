import {IGoal} from "./IGoal";
import React from "react";

export interface ICalorieHistoryProps {
    goalId: number;
    currentGoal: IGoal | null;
    setGoal: React.Dispatch<React.SetStateAction<IGoal | null>>;
}