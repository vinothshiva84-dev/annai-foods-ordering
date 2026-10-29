
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

export default function Home() {
  const [quantities, setQuantities] = useState({});
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const total = MENU.reduce(
    (sum, item) =>
      sum + item.price * (quantities[item.name] || 0),
    0
  );

  const itemCount = Object.values(quantities).reduce(
    (sum, qty) => sum + qty,
    0
  );

  const idiyappamPlates =
    MENU.reduce((sum, item) => {
      const qty = quantities[item.name] || 0;

      if (item.type === "idiyappam") return sum + qty;
      if (item.type === "combo") return sum + qty * 2;

      return sum;
    }, 0);

  function changeQuantity(name, amount) {
    setQuantities((previous) => ({
      ...previous,
      [name]: Math.max(0, (previous[name] || 0) + amount)
    }));
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

    if (itemCount === 0) {
      setError("Please select your food.");
      return;
    }

    if (idiyappamPlates < 5) {
      setError("Minimum order is 5 plates of Idiyappam.");
      return;
    }

    if (new Date().getHours() >= 12) {
      setError("Orders must be placed before 12:00 PM.");
      return;
    }

    const orderLines = MENU
      .filter((item) => quantities[item.name] > 0)
      .map((item) => {
        const qty = quantities[item.name];
        return `${item.name} x ${qty} = R${item.price * qty}`;
      });

    const message = [
      "ANNAl FOODS - NEW ORDER",
      "",
      `Customer: ${customer}`,
      `Customer WhatsApp: ${phone}`,
      "",
      "ORDER DETAILS:",
      ...orderLines,
      "",
      `Idiyappam plates: ${idiyappamPlates}`,
      `TOTAL: R${total}`,
      "",
      "Collection: Home collection",
      "Thank you for ordering with Annai Foods!"
    ].join("\n");

    const url =
      "https://wa.me/27651188768?text=" +
      encodeURIComponent(message);

    window.open(url, "_blank");
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#fff8ed",
      padding: "20px 14px",
      fontFamily: "Arial, sans-serif",
      color: "#352315"
    },
    container: {
      maxWidth: "650px",
      margin: "auto"
    },
    card: {
      background: "white",
      borderRadius: "14px",
      padding: "17px",
      marginBottom: "14px",
      boxShadow: "0 2px 8px #0000000c"
    },
    button: {
      border: "none",
      background: "#75451f",
      color: "white",
      padding: "10px 15px",
      borderRadius: "8px",
      fontSize: "17px",
      fontWeight: "bold"
    },
    field: {
      width: "100%",
      padding: "13px",
      marginTop: "7px",
      marginBottom: "13px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      boxSizing: "border-box",
      fontSize: "16px"
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>

        <header style={{
          textAlign: "center",
          padding: "25px 10px"
        }}>
          <h1 style={{
            color: "#75451f",
            fontSize: "34px",
            margin: "5px"
          }}>
            Annai Foods
          </h1>

          <h3 style={{ margin: "10px" }}>
            Welcome to Annai Foods
          </h3>

          <p>
            Order your favourite food through WhatsApp.
          </p>

          <p style={{ color: "#75451f", fontWeight: "bold" }}>
            Fresh food made with love!
          </p>
        </header>

        <section style={styles.card}>
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
                borderBottom: "1px solid #eee"
              }}
            >
              <div style={{ flex: 1 }}>
                <strong>{item.name}</strong>

                {item.description && (
                  <div style={{
                    fontSize: "12px",
                    color: "#777",
                    marginTop: "4px"
                  }}>
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
                gap: "10px"
              }}>
                <button
                  style={styles.button}
                  onClick={() => changeQuantity(item.name, -1)}
                >
                  −
                </button>

                <strong style={{
                  minWidth: "15px",
                  textAlign: "center"
                }}>
                  {quantities[item.name] || 0}
                </strong>

                <button
                  style={styles.button}
                  onClick={() => changeQuantity(item.name, 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </section>

        <section style={styles.card}>
          <h2>Your Order Summary</h2>

          <p>Selected items: {itemCount}</p>
          <p>Idiyappam plates: {idiyappamPlates}</p>

          <h2 style={{ color: "#75451f" }}>
            Total: R{total}
          </h2>
        </section>

        <section style={styles.card}>
          <h2>Customer Details</h2>

          <label>Your Name</label>
          <input
            style={styles.field}
            placeholder="Enter your full name"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />

          <label>WhatsApp Number</label>
          <input
            style={styles.field}
            placeholder="Enter your phone number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <p><strong>Collection:</strong> Home collection only</p>

          <p>
            <strong>Ordering time:</strong> Before 12:00 PM
          </p>

          {error && (
            <p style={{ color: "red", fontWeight: "bold" }}>
              {error}
            </p>
          )}

          <button
            onClick={placeOrder}
            style={{
              ...styles.button,
              width: "100%",
              padding: "16px",
              background: "#218838",
              fontSize: "18px",
              cursor: "pointer"
            }}
          >
            Order Now on WhatsApp
          </button>

          <p style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#777"
          }}>
            Your order will be sent to Annai Foods WhatsApp.
          </p>
        </section>

        <footer style={{
          textAlign: "center",
          padding: "20px"
        }}>
          <strong>Thank you for choosing Annai Foods!</strong>
          <p>WhatsApp: 0651188768</p>
        </footer>

      </div>
    </main>
  );
}

