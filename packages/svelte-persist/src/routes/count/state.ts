import { z } from "zod"

const ZodJsonParse = z.string().transform((s, ctx) => {
    try {
        return JSON.parse(s)
    }
    catch (e) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Not JSON" })
        return z.NEVER
    }
})

export type State = z.infer<typeof State>
export const State = z.object({
    count: z.number(),
}).readonly()
export const StateString = ZodJsonParse.pipe(State)
