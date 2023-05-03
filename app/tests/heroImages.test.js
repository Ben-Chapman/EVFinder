/**
 * @jest-environment jsdom
 */
import "./mocks/matchMedia.mock";
import { getHeroImage, heroImages } from "../src/helpers/heroImages";

describe("Hero Image Selector", () => {
  // I suppose, given the number of images to be selected randomly, calling getHeroImage()
  // twice could return the same image twice. Using retryTimes() to retry if that happens.
  // It's very unlikely that getHeroImage() will randomly select the same image for two
  // test runs
  jest.retryTimes(1);
  test("An image is selected randomly", () => {
    const image1 = getHeroImage()["imageUrl"];
    const image2 = getHeroImage()["imageUrl"];

    expect(image1).not.toEqual(image2);
  });

  test("An image has a position", () => {
    const positions = getHeroImage()["portraitPosition"].split(" ");
    positions.forEach((position) => {
      // At a minimum a CSS position could be 1px
      expect(position).toMatch(/(-?\d{1,3}rem)|center/);
    });
  });

  test("An image has a display name", () => {
    expect(getHeroImage()["displayName"]).not.toBeNull;
  });

  test("An image has a model name", () => {
    expect(getHeroImage()["model"]).not.toBeNull;
  });

  test("An image has a text color", () => {
    expect(getHeroImage()["textColor"]).not.toBeNull;
  });
});

describe("Test attributes for all hero images", () => {
  test("A hero image has all attributes", () => {
    heroImages.forEach((model) => {
      expect(model.imageNames).toHaveProperty(displayName);
      // model.forEach(image => {

      // })
    });
  });
});
