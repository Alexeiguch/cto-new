import { v4 as uuid } from "uuid";
import db from "./connection.js";

const insertStatement = db.prepare(`
  INSERT INTO ContentPlan (id, propertyId, planType, title, promptSummary, payload, createdAt)
  VALUES (@id, @propertyId, @planType, @title, @promptSummary, @payload, @createdAt)
`);

const listStatement = db.prepare(`
  SELECT id, propertyId, planType, title, promptSummary, payload, createdAt
  FROM ContentPlan
  ORDER BY datetime(createdAt) DESC
`);

export const createContentPlan = ({ propertyId, planType, title, payload, promptSummary }) => {
  const record = {
    id: uuid(),
    propertyId,
    planType,
    title,
    promptSummary: promptSummary || null,
    payload: JSON.stringify(payload),
    createdAt: new Date().toISOString()
  };

  insertStatement.run(record);

  return {
    ...record,
    payload
  };
};

export const listContentPlans = () => {
  return listStatement.all().map((row) => ({
    ...row,
    payload: JSON.parse(row.payload)
  }));
};
