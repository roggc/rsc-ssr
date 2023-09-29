export async function fillJSXWithClientComponents(jsx) {
  if (
    typeof jsx === "string" ||
    typeof jsx === "number" ||
    typeof jsx === "boolean" ||
    jsx == null
  ) {
    // Don't need to do anything special with these types.
    return jsx;
  } else if (Array.isArray(jsx)) {
    // Process each item in an array.
    return Promise.all(
      jsx.map(async (child) => await fillJSXWithClientComponents(child))
    );
  } else if (typeof jsx === "object") {
    if (jsx.$$typeof === Symbol.for("react.element")) {
      if (jsx.type === Symbol.for("react.fragment")) {
        return {
          ...jsx,
          props: await fillJSXWithClientComponents(jsx.props),
        };
      } else if (typeof jsx.type === "string") {
        // This is a component like <div />.
        // Go over its props to make sure they can be turned into JSON.
        return {
          ...jsx,
          props: await fillJSXWithClientComponents(jsx.props),
        };
      } else if (
        typeof jsx.type === "object" &&
        (jsx.type.file || jsx.type.file_)
      ) {
        const path = jsx.type.file
          ? "../../../src/client/".concat(jsx.type.file).concat(".js")
          : "../".concat(jsx.type.file_).concat(".js");
        return {
          ...jsx,
          type: (await import(path)).default,
          props: await fillJSXWithClientComponents(jsx.props),
        };
      } else throw new Error("Not implemented.");
    } else {
      // This is an arbitrary object (for example, props, or something inside of them).
      // Go over every value inside, and process it too in case there's some JSX in it.
      return Object.fromEntries(
        await Promise.all(
          Object.entries(jsx).map(async ([propName, value]) => [
            propName,
            await fillJSXWithClientComponents(value),
          ])
        )
      );
    }
  } else throw new Error("Not implemented");
}
