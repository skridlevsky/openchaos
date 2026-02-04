import { getCurrentCount } from "@/lib/count/getCount";

export async function WebCounter() {
  let count = -1;
  try {
    count = await getCurrentCount();
  } catch (e) {
    console.error(e)
    console.error('Unable to fetch current pageview count.');
  }

  // Format leading zeros

  let formattedCount = count.toString().padStart(8, "0");

  if (count === -1) {
    formattedCount = 'xerrorx'
  }

  // Split for each "cell"
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
                <span className="sparkle-glint">★</span> YOU ARE VISITOR NUMBER <span className="sparkle-glint sparkle-delay-3">★</span>
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
