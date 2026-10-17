import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import * as impl from "../umeet.server";
import * as schemas from "../umeet-schemas";
export const createFamily = createServerFn({ method: "POST" })
  .inputValidator(schemas.createFamilySchema)
  .handler(async ({ data }) => impl.createFamilyImpl(data));

export const getFamily = createServerFn({ method: "POST" })
  .inputValidator(schemas.getFamilySchema)
  .handler(async ({ data }) => impl.getFamilyImpl(data));

export const setMood = createServerFn({ method: "POST" })
  .inputValidator(schemas.setMoodSchema)
  .handler(async ({ data }) => impl.setMoodImpl(data));

export const sendNote = createServerFn({ method: "POST" })
  .inputValidator(schemas.sendNoteSchema)
  .handler(async ({ data }) => impl.sendNoteImpl(data));

export const setLocation = createServerFn({ method: "POST" })
  .inputValidator(schemas.setLocationSchema)
  .handler(async ({ data }) => impl.setLocationImpl(data));

export const careForCompanion = createServerFn({ method: "POST" })
  .inputValidator(schemas.careForCompanionSchema)
  .handler(async ({ data }) => impl.careForCompanionImpl(data));

export const submitCheckin = createServerFn({ method: "POST" })
  .inputValidator(schemas.submitCheckinSchema)
  .handler(async ({ data }) => impl.submitCheckinImpl(data));

export const decideSession = createServerFn({ method: "POST" })
  .inputValidator(schemas.decideSessionSchema)
  .handler(async ({ data }) => impl.decideSessionImpl(data));

export const requestSession = createServerFn({ method: "POST" })
  .inputValidator(schemas.requestSessionSchema)
  .handler(async ({ data }) => impl.requestSessionImpl(data));

