// ============================================================
// ACTION RESULT TYPE
//
// Every server action in this app returns this exact shape.
// The "T" is a TypeScript generic — see the explanation
// at the bottom of this file.
//
// Three possible states a server action can be in:
//
//   Success:  { success: true,  data: <your data>, error: null }
//   Failure:  { success: false, data: null,         error: "something went wrong" }
//   Loading:  (before the action completes — handled by the UI)
// ============================================================

export type ActionResult<T = void> =
  | { success: true;  data: T;    error: null }
  | { success: false; data: null; error: string }


// ============================================================
// ACTION WRAPPER
//
// A single function that wraps any async server action.
// Instead of every action having its own try/catch block,
// you hand your logic to actionWrapper and it handles:
//   - Running your async function
//   - Returning { success: true, data } on success
//   - Catching any error and returning { success: false, error }
//
// Usage:
//   return actionWrapper(async () => {
//     const result = await doSomething()
//     return result
//   })
// ============================================================

export async function actionWrapper<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return {
      success: true,
      data,
      error: null,
    }
  } catch (err) {
    // Pull the message out of an Error object if possible,
    // otherwise fall back to a generic string.
    const message =
      err instanceof Error
        ? err.message
        : 'An unexpected error occurred. Please try again.'

    // Log the full error on the server (never reaches the browser)
    console.error('[actionWrapper]', err)

    return {
      success: false,
      data: null,
      error: message,
    }
  }
}


// ============================================================
// WHAT ARE TYPESCRIPT GENERICS?
// ============================================================
//
// A generic is a placeholder for a type — like a variable,
// but for types instead of values.
//
// Instead of writing a separate ActionResult for every
// possible return type:
//
//   type ActionResultString  = { data: string  | null; error: ... }
//   type ActionResultNumber  = { data: number  | null; error: ... }
//   type ActionResultEvent   = { data: Event   | null; error: ... }
//   type ActionResultEvent[] = { data: Event[] | null; error: ... }
//   // ...forever
//
// You write it ONCE with a placeholder called T:
//
//   type ActionResult<T> = { data: T | null; error: ... }
//
// Then callers "fill in" T when they use it:
//
//   ActionResult<Event>    → { data: Event   | null; error: ... }
//   ActionResult<Event[]>  → { data: Event[] | null; error: ... }
//   ActionResult<string>   → { data: string  | null; error: ... }
//   ActionResult<void>     → { data: void    | null; error: ... }
//
// TypeScript figures out T automatically from whatever your
// async function returns — you rarely have to write it yourself.
//
// REAL EXAMPLE from this app:
//
//   // This action returns a single Event
//   export async function getEvent(id: string): Promise<ActionResult<Event>> {
//     return actionWrapper(async () => {
//       const supabase = await createClient()
//       const { data, error } = await supabase
//         .from('events')
//         .select('*')
//         .eq('id', id)
//         .single()
//       if (error) throw new Error(error.message)
//       return data  // TypeScript knows this is an Event
//     })
//   }
//
//   // In your component:
//   const result = await getEvent('123')
//   if (result.success) {
//     console.log(result.data.name)  // ✅ TypeScript knows .data is an Event
//   } else {
//     console.log(result.error)      // ✅ TypeScript knows .error is a string
//   }
// ============================================================
