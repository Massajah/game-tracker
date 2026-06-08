import { fireEvent, render, screen } from "@testing-library/react";
import StatusPage from "./StatusPage";

jest.mock("../components/GameCard", () => function MockGameCard({ game }) {
  return <div>{game.title}</div>;
});

const renderStatusPage = (props = {}) =>
  render(
    <StatusPage
      title="Wishlist"
      status="wishlist"
      games={[]}
      updateStatus={() => {}}
      deleteGame={() => {}}
      openGameDetails={() => {}}
      {...props}
    />
  );

test("collapses and expands status filters", () => {
  renderStatusPage();

  const toggle = screen.getByRole("button", { name: "Filters ▼" });
  const panel = document.querySelector(".status-filter-panel");

  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(panel.classList.contains("is-open")).toBe(false);

  fireEvent.click(toggle);

  expect(toggle.textContent).toBe("Filters ▲");
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  expect(panel.classList.contains("is-open")).toBe(true);
  expect(screen.getByText("Sort by")).toBeTruthy();
  expect(screen.getByText("Genre")).toBeTruthy();
  expect(screen.getByText("Platform")).toBeTruthy();
});

test("resets sort, genre, and platform filters only", () => {
  const updateStatus = jest.fn();

  renderStatusPage({
    updateStatus,
    games: [
      {
        _id: "1",
        title: "Celeste",
        status: "wishlist",
        createdAt: "2024-01-01",
        genres: [{ name: "Platformer" }],
        platforms: [{ platform: { name: "PC" } }],
      },
      {
        _id: "2",
        title: "Hades",
        status: "wishlist",
        createdAt: "2024-02-01",
        genres: [{ name: "Action" }],
        platforms: [{ platform: { name: "Switch" } }],
      },
    ],
  });

  const sortSelect = screen.getByLabelText("Sort by");
  const genreSelect = screen.getByLabelText("Genre");
  const platformSelect = screen.getByLabelText("Platform");

  fireEvent.change(sortSelect, { target: { value: "titleAsc" } });
  fireEvent.change(genreSelect, { target: { value: "Action" } });
  fireEvent.change(platformSelect, { target: { value: "Switch" } });

  fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));

  expect(sortSelect.value).toBe("recentlyAdded");
  expect(genreSelect.value).toBe("All");
  expect(platformSelect.value).toBe("All");
  expect(updateStatus).not.toHaveBeenCalled();
});
