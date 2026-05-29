import { fireEvent, render, screen } from "@testing-library/react";
import StarRating from "./StarRating";

function setSliderBounds(slider, width = 200) {
  slider.getBoundingClientRect = () => ({
    bottom: 32,
    height: 32,
    left: 0,
    right: width,
    top: 0,
    width,
    x: 0,
    y: 0,
    toJSON: () => {},
  });
}

test("selects a half-star rating from the pointer position", () => {
  const handleChange = jest.fn();

  render(<StarRating value="" onChange={handleChange} />);

  const slider = screen.getByRole("slider", { name: "Rating" });
  setSliderBounds(slider);

  fireEvent.click(slider, { clientX: 150 });

  expect(handleChange).toHaveBeenCalledWith(7.5);
});

test("previews hovered rating without changing the selected rating text", () => {
  const { container } = render(<StarRating value={4} onChange={jest.fn()} />);

  const slider = screen.getByRole("slider", { name: "Rating" });
  setSliderBounds(slider);

  fireEvent.mouseMove(slider, { clientX: 150 });

  const fills = container.querySelectorAll(".star-rating-star-fill");

  expect(fills[0].style.getPropertyValue("--star-fill")).toBe("100%");
  expect(fills[6].style.getPropertyValue("--star-fill")).toBe("100%");
  expect(fills[7].style.getPropertyValue("--star-fill")).toBe("50%");
  expect(screen.getByText("4 / 10")).not.toBeNull();
});

test("clears the current rating when clear is available", () => {
  const handleClear = jest.fn();

  render(<StarRating value={8} onChange={jest.fn()} onClear={handleClear} />);

  fireEvent.click(screen.getByRole("button", { name: "Clear" }));

  expect(handleClear).toHaveBeenCalledTimes(1);
});
