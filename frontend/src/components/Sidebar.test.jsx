import { fireEvent, render, screen } from "@testing-library/react";
import Sidebar from "./Sidebar";

jest.mock(
  "react-router-dom",
  () => ({
    NavLink: ({ children, onClick, to }) => (
      <a
        href={to}
        onClick={(event) => {
          event.preventDefault();
          onClick?.(event);
        }}
      >
        {children}
      </a>
    ),
  }),
  { virtual: true }
);

const baseProps = {
  user: { username: "Responsive Tester" },
  logout: jest.fn(),
  stats: {
    total: 12,
    wishlist: 3,
    backlog: 4,
    playing: 2,
    completed: 3,
    averageRating: "8.0",
  },
  theme: "light",
  setTheme: jest.fn(),
};

function renderSidebar(props = {}) {
  return render(<Sidebar {...baseProps} {...props} />);
}

test("opens and closes the mobile drawer from the hamburger and overlay", () => {
  renderSidebar();

  fireEvent.click(
    screen.getByRole("button", { name: "Open navigation menu" })
  );

  expect(document.querySelector(".mobile-menu-overlay")).not.toBeNull();
  expect(document.querySelector(".sidebar").className).toContain("mobile-open");

  fireEvent.click(document.querySelector(".mobile-menu-overlay"));

  expect(document.querySelector(".mobile-menu-overlay")).toBeNull();
  expect(document.querySelector(".sidebar").className).not.toContain(
    "mobile-open"
  );
});

test("closes the mobile drawer after selecting a nav link", () => {
  renderSidebar();

  fireEvent.click(
    screen.getByRole("button", { name: "Open navigation menu" })
  );
  fireEvent.click(screen.getByRole("link", { name: "Wishlist" }));

  expect(document.querySelector(".mobile-menu-overlay")).toBeNull();
  expect(document.querySelector(".sidebar").className).not.toContain(
    "mobile-open"
  );
});
