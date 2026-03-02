"use client";

export function WebCounter() {
  const count = 1337;
  const formattedCount = count.toString().padStart(6, "0");
  const digits = formattedCount.split("");

  return (
    <div className="webcounter-container">
      <table
        border={2}
        cellPadding={5}
        cellSpacing={0}
        className="webcounter-table"
      >
        <tbody>
          <tr>
            <td
              colSpan={6}
              className="webcounter-header-cell"
            >
              <span className="webcounter-header-text">
                <span className="sparkle-glint">&#9733;</span> YOU ARE VISITOR NUMBER <span className="sparkle-glint sparkle-delay-3">&#9733;</span>
              </span>
            </td>
          </tr>
          <tr>
            {digits.map((digit, index) => (
              <td
                key={index}
                className="webcounter-digit-cell"
              >
                <span className="webcounter-digit-text">
                  {digit}
                </span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
