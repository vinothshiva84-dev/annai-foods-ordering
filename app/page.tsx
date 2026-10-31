
"use client";

import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type MenuItem = {
  name: string;
  price: number;
  type?: "idiyappam" | "combo";
  description?: string;
};

type CollectionMethod = "Home collection" | "Uber pickup";

const MENU: MenuItem[] = [
  { name: "Rice Idiyappam", price: 30, type: "idiyappam" },
  { name: "Ragi Idiyappam", price: 35, type: "idiyappam" },
  { name: "Wheat Idiyappam", price: 35, type: "idiyappam" },
  { name: "Lamb Kurma / Gravy", price: 140 },
  { name: "Chicken Kurma / Gravy", price: 100 },
  { name: "Egg Kurma", price: 90 },
  { name: "Veg White Kurma", price: 80 },
  { name: "Egg Semiya", price: 80 },
  { name: "Coconut Milk", price: 50 },
  {
    name: "Combo 1",
    price: 140,
    description: "2 plates Idiyappam + 1 portion Chicken Gravy",
    type: "combo",
  },
  {
    name: "Combo 2",
    price: 125,
    description: "2 plates Idiyappam + Veg White Kurma + Coconut Milk",
    type: "combo",
  },
];

const COLLECTION_ADDRESS =
  "Unit 23, Fairview Crescent, Wood County Estate, Midrand, Johannesburg";

// Annai Foods official WhatsApp notification number.
const WHATSAPP_NUMBER = "+27651188768";

// wa.me requires the number without the plus sign.
const WHATSAPP_LINK_NUMBER = WHATSAPP_NUMBER.replace(/^\+/, "");

// Supabase publishable key only.
// Never use a secret API key or service_role key in browser code.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey)
    : null;

function isValidCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export default function Home() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [collectionDate, setCollectionDate] = useState("");
  const [collectionMethod, setCollectionMethod] =
    useState<CollectionMethod>("Home collection");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState("");

  const selectedItems = useMemo(
    () => MENU.filter((item) => (quantities[item.name] || 0) > 0),
    [quantities]
  );

  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * (quantities[item.name] || 0),
    0
  );

  const itemCount = selectedItems.reduce(
    (sum, item) => sum + (quantities[item.name] || 0),
    0
  );

  const idiyappamPlates = selectedItems.reduce((sum, item) => {
    const quantity = quantities[item.name] || 0;

    if (item.type === "idiyappam") return sum + quantity;

    if (item.type === "combo") return sum + quantity * 2;

    return sum;
  }, 0);

  function changeQuantity(name: string, amount: number) {
    setQuantities((previous) => ({
      ...previous,
      [name]: Math.max(0, (previous[name] || 0) + amount),
    }));

    setError("");
  }

  // Always use Johannesburg local date and time.
  function johannesburgParts() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Johannesburg",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());

    const get = (type: string) =>
      parts.find((part) => part.type === type)?.value || "00";

    return {
      year: Number(get("year")),
      month: Number(get("month")),
      day: Number(get("day")),
      hour: Number(get("hour")),
      minute: Number(get("minute")),
    };
  }

  // Before 12 PM: today is allowed.
  // From 12 PM onwards: tomorrow is the earliest date.
  function minimumCollectionDate() {
    const now = johannesburgParts();

    const date = new Date(
      Date.UTC(now.year, now.month - 1, now.day)
    );

    if (now.hour >= 12) {
      date.setUTCDate(date.getUTCDate() + 1);
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function formatDate(value: string) {
    const [year, month, day] = value.split("-").map(Number);

    return new Date(
      Date.UTC(year, month - 1, day)
    ).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  function generateOrderNumber() {
    const random = new Uint32Array(1);

    crypto.getRandomValues(random);

    return String(1000 + (random[0] % 9000));
  }

  function orderLines() {
    return selectedItems.map((item) => ({
      name: item.name,
      quantity: quantities[item.name],
      price: item.price,
      subtotal: item.price * quantities[item.name],
    }));
  }

  function validate() {
    if (!supabase) {
      setError(
        "The Annai Foods database connection is not configured. Please contact Annai Foods."
      );
      return false;
    }

    if (!customer.trim()) {
      setError("Please enter your full name.");
      return false;
    }

    if (!phone.trim()) {
      setError("Please enter your WhatsApp number.");
      return false;
    }

    if (selectedItems.length === 0) {
      setError("Please select food from the menu.");
      return false;
    }

    if (idiyappamPlates < 5) {
      setError("Minimum order is 5 plates of Idiyappam.");
      return false;
    }

    if (!collectionDate) {
      setError("Please select your collection date.");
      return false;
    }

    const todayMinimum = minimumCollectionDate();

    if (
      !isValidCalendarDate(collectionDate) ||
      collectionDate < todayMinimum
    ) {
      setCollectionDate("");

      setError(
        `Invalid collection date. Please select ${formatDate(todayMinimum)} or a later date.`
      );

      return false;
    }

    if (
      collectionMethod !== "Home collection" &&
      collectionMethod !== "Uber pickup"
    ) {
      setError("Please select a collection method.");
      return false;
    }

    return true;
  }

  async function submitOrder() {
    setError("");

    if (loading || !validate() || !supabase) return;

    setLoading(true);

    try {
      // Check the date again immediately before saving.

      const latestMinimumDate = minimumCollectionDate();

      if (
        !isValidCalendarDate(collectionDate) ||
        collectionDate < latestMinimumDate
      ) {
        setCollectionDate("");

        setError(
          "Your selected collection date is no longer valid. Please select a new date."
        );

        setLoading(false);
        return;
      }

      let savedOrderNumber = "";
      let lastError: any = null;

      // Generate a random four-digit order number.
      // orders.order_number must have a UNIQUE database constraint.

      for (let attempt = 0; attempt < 30; attempt++) {
        const candidate = generateOrderNumber();

        const { error: insertError } = await supabase
          .from("orders")
          .insert({
            order_number: candidate,
            customer_name: customer.trim(),
            customer_phone: phone.trim(),
            items: orderLines(),
            total_amount: total,
            idiyappam_plates: idiyappamPlates,
            collection_date: collectionDate,
            collection_method: collectionMethod,
          });

        if (!insertError) {
          savedOrderNumber = candidate;
          break;
        }

        lastError = insertError;

        if (insertError.code !== "23505") {
          throw insertError;
        }
      }

      if (!savedOrderNumber) {
        throw (
          lastError ||
          new Error("Could not create a unique order number.")
        );
      }

      setSubmittedOrderNumber(savedOrderNumber);

      const message = [
        "ANNAI FOODS - NEW ORDER",
        "",
        `Order number: ${savedOrderNumber}`,
        `Customer: ${customer.trim()}`,
        `WhatsApp: ${phone.trim()}`,
        `Collection date: ${formatDate(collectionDate)}`,
        `Collection method: ${collectionMethod}`,
        "",
        "ORDER DETAILS:",
        ...orderLines().map(
          (item) =>
            `${item.name} x ${item.quantity} = R${item.subtotal}`
        ),
        "",
        `Total selected items: ${itemCount}`,
        `Total Idiyappam plates: ${idiyappamPlates}`,
        `GRAND TOTAL: R${total}`,
        "",
        "COLLECTION / UBER PICKUP ADDRESS:",
        COLLECTION_ADDRESS,
        "",
        collectionMethod === "Uber pickup"
          ? "Customer has selected Uber pickup. Please arrange collection with the customer."
          : "Customer has selected home collection.",
        "",
        "Thank you for choosing Annai Foods!",
      ].join("\n");

      // Open WhatsApp using the corrected notification number.

      window.location.href =
        `https://wa.me/${WHATSAPP_LINK_NUMBER}?text=${encodeURIComponent(message)}`;

    } catch (err: any) {
      console.error("Annai Foods order submission error:", err);

      setError(
        err?.message ||
          "Your order could not be submitted. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const buttonStyle: React.CSSProperties = {
    border: "none",
    background: "#75451f",
    color: "#fff",
    padding: "9px 14px",
    borderRadius: "8px",
    fontSize: "17px",
    fontWeight: 700,
    cursor: "pointer",
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px",
    margin: "7px 0 15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    boxSizing: "border-box",
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: "16px",
    padding: "18px",
    marginBottom: "16px",
    boxShadow: "0 2px 8px #0000000c",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff8ed",
        padding: "20px 14px",
        fontFamily: "Arial, sans-serif",
        color: "#352315",
      }}
    >
      <div style={{ maxWidth: "650px", margin: "auto" }}>

        <header
          style={{
            textAlign: "center",
            padding: "22px 16px 26px",
            marginBottom: "16px",
            background: "#fffdf5",
            border: "1px solid #dce8d5",
            borderRadius: "18px",
          }}
        >
          <img
            src="/annai-foods-logo.jpg"
            alt="Annai Foods Logo"
            style={{
              display: "block",
              width: "min(100%, 330px)",
              height: "auto",
              objectFit: "contain",
              margin: "0 auto 12px",
            }}
          />

          <h1 style={{ color: "#075b20", fontSize: "30px" }}>
            Welcome to Annai Foods ❤️
          </h1>

          <h3 style={{ color: "#397c2c" }}>
            Fresh Homemade Idiyappam · Made with Love
          </h3>

          <p>
            Choose your food, review your cart and submit your order.
          </p>
        </header>

        <section style={cardStyle}>
          <h2>Our Food Menu</h2>

          <p style={{ color: "#a04b24" }}>
            Minimum 5 plates of Idiyappam per order.
          </p>

          {MENU.map((item) => (
            <div
              key={item.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "8px",
                padding: "13px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div style={{ flex: 1 }}>
                <strong>{item.name}</strong>

                {item.description && (
                  <div style={{ fontSize: "12px", color: "#777" }}>
                    {item.description}
                  </div>
                )}

                <div style={{ color: "#75451f", fontWeight: 700 }}>
                  R{item.price}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                }}
              >
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => changeQuantity(item.name, -1)}
                >
                  −
                </button>

                <strong>{quantities[item.name] || 0}</strong>

                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => changeQuantity(item.name, 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </section>

        <section
          style={{
            ...cardStyle,
            border: "2px solid #218838",
          }}
        >
          <h2>🛒 Your Shopping Cart</h2>

          {selectedItems.length === 0 ? (
            <p style={{ color: "#777" }}>
              Your cart is empty. Please select food from the menu.
            </p>
          ) : (
            selectedItems.map((item) => (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div>
                  <strong>{item.name}</strong>

                  <div style={{ fontSize: "13px", color: "#777" }}>
                    R{item.price} × {quantities[item.name]}
                  </div>

                  <strong style={{ color: "#75451f" }}>
                    R{item.price * quantities[item.name]}
                  </strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                  }}
                >
                  <button
                    type="button"
                    style={buttonStyle}
                    onClick={() => changeQuantity(item.name, -1)}
                  >
                    −
                  </button>

                  <strong>{quantities[item.name]}</strong>

                  <button
                    type="button"
                    style={buttonStyle}
                    onClick={() => changeQuantity(item.name, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}

          <p>
            Total selected items: <strong>{itemCount}</strong>
          </p>

          <p>
            Total Idiyappam plates: <strong>{idiyappamPlates}</strong>
          </p>

          <h2 style={{ color: "#218838" }}>
            Grand Total: R{total}
          </h2>
        </section>

        <section style={cardStyle}>
          <h2>📍 Collection / Uber Pickup Address</h2>

          <p>{COLLECTION_ADDRESS}</p>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              COLLECTION_ADDRESS
            )}`}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#18783a",
              fontWeight: 700,
            }}
          >
            Get Directions on Google Maps
          </a>
        </section>

        <section style={cardStyle}>
          <h2>Customer Details</h2>

          <label htmlFor="customer">Your Name</label>

          <input
            id="customer"
            style={fieldStyle}
            placeholder="Enter your full name"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />

          <label htmlFor="phone">WhatsApp Number</label>

          <input
            id="phone"
            style={fieldStyle}
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label htmlFor="collectionDate">Collection Date</label>

          <input
            id="collectionDate"
            style={fieldStyle}
            type="date"
            min={minimumCollectionDate()}
            value={collectionDate}
            onChange={(e) => {
              const selectedDate = e.target.value;
              const earliestDate = minimumCollectionDate();

              if (!selectedDate) {
                setCollectionDate("");
                setError("");
                return;
              }

              if (
                !isValidCalendarDate(selectedDate) ||
                selectedDate < earliestDate
              ) {
                setCollectionDate("");

                setError(
                  `Past dates are not allowed. Please select ${formatDate(earliestDate)} or a later date.`
                );

                return;
              }

              setCollectionDate(selectedDate);
              setError("");
            }}
          />

          <p style={{ color: "#397c2c", fontSize: "14px" }}>
            {johannesburgParts().hour >= 12
              ? "Today's collection is closed. Select tomorrow or any future date."
              : "Select today before 12 PM or any future date."}
          </p>

          <hr style={{ border: "none", borderTop: "1px solid #eee" }} />

          <h2>🚗 Choose Your Collection Method</h2>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "15px",
              marginBottom: "10px",
              border:
                collectionMethod === "Home collection"
                  ? "2px solid #218838"
                  : "1px solid #ddd",
              borderRadius: "10px",
              background:
                collectionMethod === "Home collection"
                  ? "#f0fff3"
                  : "#fff",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="collectionMethod"
              value="Home collection"
              checked={collectionMethod === "Home collection"}
              onChange={() => {
                setCollectionMethod("Home collection");
                setError("");
              }}
            />

            <span>
              <strong>🏠 Home Collection</strong>
              <br />
              <span style={{ fontSize: "13px", color: "#666" }}>
                Collect your order from our home address.
              </span>
            </span>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "15px",
              marginBottom: "15px",
              border:
                collectionMethod === "Uber pickup"
                  ? "2px solid #218838"
                  : "1px solid #ddd",
              borderRadius: "10px",
              background:
                collectionMethod === "Uber pickup"
                  ? "#f0fff3"
                  : "#fff",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="collectionMethod"
              value="Uber pickup"
              checked={collectionMethod === "Uber pickup"}
              onChange={() => {
                setCollectionMethod("Uber pickup");
                setError("");
              }}
            />

            <span>
              <strong>🚗 Uber Pickup</strong>
              <br />
              <span style={{ fontSize: "13px", color: "#666" }}>
                Arrange an Uber to collect your order from our address.
              </span>
            </span>
          </label>

          {collectionMethod === "Uber pickup" && (
            <div
              style={{
                background: "#fff8ed",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "15px",
                fontSize: "14px",
              }}
            >
              <strong>Uber Pickup Instructions</strong>

              <p>
                Your Uber driver must collect the order from:
              </p>

              <p>{COLLECTION_ADDRESS}</p>

              <p>
                Annai Foods will receive your Uber pickup selection
                with your order details through WhatsApp.
              </p>

              <p>
                Uber arrangements and charges are the customer's
                responsibility.
              </p>
            </div>
          )}

          <p>
            <strong>Order cutoff:</strong> 12:00 PM Johannesburg time
          </p>

          <p style={{ fontSize: "14px" }}>
            Your order will be saved and the complete order details
            will open in WhatsApp for Annai Foods.
          </p>

          <button
            type="button"
            onClick={submitOrder}
            disabled={loading}
            style={{
              ...buttonStyle,
              width: "100%",
              padding: "16px",
              background: "#218838",
              opacity: loading ? 0.65 : 1,
            }}
          >
            {loading
              ? "Submitting your order..."
              : "Submit Order & Send WhatsApp Notification"}
          </button>

          {error && (
            <div
              role="alert"
              style={{
                background: "#ffe5e5",
                color: "#b00020",
                padding: "12px",
                borderRadius: "8px",
                marginTop: "15px",
              }}
            >
              {error}
            </div>
          )}
        </section>

        {submittedOrderNumber && (
          <section
            style={{
              ...cardStyle,
              border: "2px solid #218838",
            }}
          >
            <h2 style={{ color: "#218838" }}>
              Order Submitted
            </h2>

            <p>
              Your order number is:{" "}
              <strong>{submittedOrderNumber}</strong>
            </p>
          </section>
        )}

        <footer
          style={{
            textAlign: "center",
            padding: "20px",
            color: "#75451f",
          }}
        >
          <p>Thank you for choosing Annai Foods ❤️</p>
          <p>Fresh Homemade Idiyappam · Made with Love</p>
        </footer>

      </div>
    </main>
  );
}
