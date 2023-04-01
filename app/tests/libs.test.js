import * as libs from "../src/helpers/libs";
describe("Chatbot", () => {
  test("Input should be Title Cased", () => {
    expect(libs.titleCase("title case here")).toBe("Title Case Here");

    expect(libs.titleCase("the EVFinder")).toBe("The EVFinder");

    expect(libs.titleCase("this sHould be a Title")).toBe("This SHould Be A Title");

    expect(libs.titleCase("this sHould be a Title")).toBe("This SHould Be A Title");

    expect(
      libs.titleCase("This is the thirty-third day of the month — wait, no it's not!")
    ).toBe("This Is The Thirty-third Day Of The Month — Wait, No It's Not!");
  });
});

test("Number should be converted to currency", () => {
  expect(libs.convertToCurrency(38091)).toBe("$38,091");
  expect(libs.convertToCurrency(147062)).toBe("$147,062");
  expect(libs.convertToCurrency(1000000)).toBe("$1,000,000");
  expect(libs.convertToCurrency(1)).toBe("$1");
  // convertToCurrency() rounds to the nearest whole number
  expect(libs.convertToCurrency(0.5)).toBe("$1");
  expect(libs.convertToCurrency(1.99)).toBe("$2");
  expect(libs.convertToCurrency(1.45)).toBe("$1");
});

test("The Object keys should be sorted", () => {
  const inputObject = {
    key1: 1,
    key2: 2,
    über: "Defined as: being a superlative example of its kind or class",
    foo: "foohere",
    bar: "bar here",
    baz: ["bravo", "alpha", "zulu"],
    Álvaro: { language: ["Spanish", "Icelandic"] },
  };

  const desiredObject = {
    Álvaro: { language: ["Spanish", "Icelandic"] },
    bar: "bar here",
    baz: ["bravo", "alpha", "zulu"],
    foo: "foohere",
    key1: 1,
    key2: 2,
    über: "Defined as: being a superlative example of its kind or class",
  };
  expect(libs.sortObjectByKey(inputObject)).toMatchObject(desiredObject);
});

test("Nested Object should be flattened", () => {
  const nestedObject = {
    parent1: {
      child1: "value1",
      child2: "value2",
      child3: {
        grandchild1: "value1",
        grandchild2: "value2",
      },
    },
    parent2: {
      child1: "value1",
      child2: "value2",
      child3: {
        grandchild1: "value1",
        grandchild2: "value2",
      },
    },
  };

  const flattenedObject = {
    prefixHereParent1Child1: "value1",
    prefixHereParent1Child2: "value2",
    prefixHereParent1Child3Grandchild1: "value1",
    prefixHereParent1Child3Grandchild2: "value2",
    prefixHereParent2Child1: "value1",
    prefixHereParent2Child2: "value2",
    prefixHereParent2Child3Grandchild1: "value1",
    prefixHereParent2Child3Grandchild2: "value2",
  };

  expect(libs.flattenObject(nestedObject, "prefixHere")).toMatchObject(flattenedObject);
});

test("Should return error text Array", () => {
  const errorText = "This is error text";
  expect(libs.generateErrorMessage(errorText)).toStrictEqual(["ERROR", errorText]);
});

test("console.log the text this is a test", () => {
  const logSpy = jest.spyOn(console, "log");
  libs.cl("this is a test");
  expect(logSpy).toHaveBeenCalledWith("this is a test");
});
