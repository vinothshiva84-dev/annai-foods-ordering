
"use client";

import { useState } from "react";

const MENU = [
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
    description: "2 plates Idiyappam + Chicken",
    type: "combo"
  },
  {
    name: "Combo 2",
    price: 125,
    description: "2 plates Idiyappam + Veg White Kurma + Coconut Milk",
    type: "combo"
  }
];

const COLLECTION_ADDRESS =
  "Unit 23, Fairview Crescent, Wood County Estate, Midrand, Johannesburg";

export default function Home() {
  const [quantities, setQuantities] = useState({});
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const selectedItems = MENU.filter(
    item => (quantities[item.name] || 0) > 0
  );

  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * quantities[item.name],
    0
  );

  const itemCount = selectedItems.reduce(
    (sum, item) => sum + quantities[item.name],
    0
  );

  const idiyappamPlates = selectedItems.reduce(
    (sum, item) => {
      if (item.type === "idiyappam") {
        return sum + quantities[item.name];
      }
      if (item.type === "combo") {
        return sum + quantities[item.name] * 2;
      }
      return sum;
    },
    0
  );

  function changeQuantity(name, amount) {
    setQuantities(previous => {
      const next = Math.max(
        0,
        (previous[name] || 0) + amount
      );

      return { ...previous, [name]: next };
    });
    setError("");
  }

  function placeOrder() {
    if (!customer.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your WhatsApp number.");
      return;
    }

    if (selectedItems.length === 0) {
      setError("Please select food for your cart.");
      return;
    }

    if (idiyappamPlates < 5) {
      setError("Minimum order is 5 plates of Idiyappam.");
      return;
    }

    const now = new Date();
    const southAfricaTime = new Date(
      now.toLocaleString("en-US", {
        timeZone: "Africa/Johannesburg"
      })
    );

    if (
      southAfricaTime.getHours() >= 12
    ) {
      setError("Orders must be placed before 12:00 PM.");
      return;
    }

    const orderLines = selectedItems.map(item =>
      `${item.name} x ${quantities[item.name]} = R${item.price * quantities[item.name]}`
    );

    const message = [
      "ANNAI FOODS - NEW ORDER",
      "",
      `Customer: ${customer}`,
      `WhatsApp: ${phone}`,
      "",
      "MY ORDER:",
      ...orderLines,
      "",
      `Total Idiyappam plates: ${idiyappamPlates}`,
      `Total items: ${itemCount}`,
      `GRAND TOTAL: R${total}`,
      "",
      "HOME COLLECTION ADDRESS:",
      COLLECTION_ADDRESS,
      "",
      "Thank you for choosing Annai Foods!"
    ].join("\n");

    window.open(
      "https://wa.me/27651188768?text=" +
      encodeURIComponent(message),
      "_blank"
    );
  }

  const buttonStyle = {
    border: "none",
    background: "#75451f",
    color: "white",
    padding: "9px 14px",
    borderRadius: "8px",
    fontSize: "17px",
    fontWeight: "bold",
    cursor: "pointer"
  };

  const fieldStyle = {
    width: "100%",
    padding: "13px",
    margin: "7px 0 15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    boxSizing: "border-box"
  };

  const cardStyle = {
    background: "white",
    borderRadius: "14px",
    padding: "17px",
    marginBottom: "15px",
    boxShadow: "0 2px 8px #0000000c"
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "#fff8ed",
      padding: "20px 14px",
      fontFamily: "Arial, sans-serif",
      color: "#352315"
    }}>
      <div style={{ maxWidth: "650px", margin: "auto" }}>

        <header style={{ textAlign: "center", padding: "20px" }}>
          <h1 style={{ color: "#75451f", fontSize: "34px" }}>
            Annai Foods
          </h1>
          <h3>Homemade with Love ❤️</h3>
          <p>Order your favourite food through WhatsApp.</p>
        </header>

        <section style={cardStyle}>
          <h2>Our Food Menu</h2>
          <p style={{ color: "#a04b24" }}>
            Minimum 5 plates of Idiyappam per order.
          </p>

          {MENU.map(item => (
            <div key={item.name} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
              padding: "13px 0",
              borderBottom: "1px solid #eee"
            }}>
              <div style={{ flex: 1 }}>
                <strong>{item.name}</strong>
                {item.description && (
                  <div style={{ fontSize: "12px", color: "#777" }}>
                    {item.description}
                  </div>
                )}
                <div style={{
                  color: "#75451f",
                  fontWeight: "bold",
                  marginTop: "5px"
                }}>
                  R{item.price}
                </div>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "9px"
              }}>
                <button
                  style={buttonStyle}
                  onClick={() => changeQuantity(item.name, -1)}
                >−</button>
                <strong>{quantities[item.name] || 0}</strong>
                <button
                  style={buttonStyle}
                  onClick={() => changeQuantity(item.name, 1)}
                >+</button>
              </div>
            </div>
          ))}
        </section>

        <section style={{
          ...cardStyle,
          border: "2px solid #218838"
        }}>
          <h2>🛒 Your Shopping Cart</h2>

          {selectedItems.length === 0 ? (
            <p style={{ color: "#777" }}>
              Your cart is empty. Please select food from the menu.
            </p>
          ) : (
            selectedItems.map(item => (
              <div key={item.name} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "8px",
                padding: "12px 0",
                borderBottom: "1px solid #eee"
              }}>
                <div style={{ flex: 1 }}>
                  <strong>{item.name}</strong>
                  <div style={{ fontSize: "13px", color: "#777" }}>
                    R{item.price} × {quantities[item.name]}
                  </div>
                  <strong style={{ color: "#75451f" }}>
                    R{item.price * quantities[item.name]}
                  </strong>
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px"
                }}>
                  <button
                    style={buttonStyle}
                    onClick={() => changeQuantity(item.name, -1)}
                  >−</button>
                  <strong>{quantities[item.name]}</strong>
                  <button
                    style={buttonStyle}
                    onClick={() => changeQuantity(item.name, 1)}
                  >+</button>
                </div>
              </div>
            ))
          )}

          <div style={{ paddingTop: "15px" }}>
            <p>
              Total selected items: <strong>{itemCount}</strong>
            </p>
            <p>
              Total Idiyappam plates: <strong>{idiyappamPlates}</strong>
            </p>
            <h2 style={{ color: "#218838" }}>
              Grand Total: R{total}
            </h2>
          </div>
        </section>

        <section style={cardStyle}>
          <h2>📍 Home Collection Address</h2>
          <p>{COLLECTION_ADDRESS}</p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COLLECTION_ADDRESS)}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#18783a", fontWeight: "bold" }}
          >
            Get Directions on Google Maps
          </a>
        </section>

        <section style={cardStyle}>
          <h2>Customer Details</h2>

          <label>Your Name</label>
          <input
            style={fieldStyle}
            placeholder="Enter your full name"
            value={customer}
            onChange={e => setCustomer(e.target.value)}
          />

          <label>WhatsApp Number</label>
          <input
            style={fieldStyle}
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />

          <p><strong>Collection:</strong> Home collection only</p>
          <p><strong>Orders:</strong> Before 12:00 PM</p>

          {error && (
            <p style={{ color: "red", fontWeight: "bold" }}>
              {error}
            </p>
          )}

          <button
            onClick={placeOrder}
            style={{
              ...buttonStyle,
              width: "100%",
              padding: "16px",
              background: "#218838",
              fontSize: "18px"
            }}
          >
            Place Order on WhatsApp
          </button>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#777" }}>
            Please review your cart before sending your order.
          </p>
        </section>

        <footer style={{ textAlign: "center", padding: "20px" }}>
          <strong>Thank you for choosing Annai Foods! ❤️</strong>
          <p>WhatsApp: 0651188768</p>
        </footer>
      </div>
    </main>
  );
      }
                    
