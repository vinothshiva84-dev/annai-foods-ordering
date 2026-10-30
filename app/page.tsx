
"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

type MenuItem = {
  name: string;
  price: number;
  type?: "idiyappam" | "combo";
  description?: string;
};

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

const STORAGE_BUCKET = "payment-proofs";

// Annai Foods WhatsApp notification number
const WHATSAPP_NUMBER = "27607104011";

// Enter your verified FNB details before publishing.
const BANK = {
  name: "FNB",
  holder: "Lavanya Sivagopal",
  account: "REPLACE_WITH_YOUR_FNB_ACCOUNT_NUMBER",
  type: "FNB Aspire Current Account",
  branch: "REPLACE_WITH_YOUR_BRANCH_CODE"
};

// Use only the current Supabase project URL and publishable key.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase configuration. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Vercel."
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [collectionDate, setCollectionDate] = useState("");
  const [proof, setProof] = useState<File | null>(null);

  const [orderNumber, setOrderNumber] = useState("");
  const [reservedOrderId, setReservedOrderId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"details" | "payment" | "complete">(
    "details"
  );

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

  const idiyappamPlates = selectedItems.reduce((sum, item) => {
    if (item.type === "idiyappam") {
      return sum + quantities[item.name];
    }

    if (item.type === "combo") {
      return sum + quantities[item.name] * 2;
    }

    return sum;
  }, 0);

  function changeQuantity(name: string, amount: number) {
    setQuantities(previous => ({
      ...previous,
      [name]: Math.max(0, (previous[name] || 0) + amount)
    }));
    setError("");
  }

  function getJohannesburgNow() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Johannesburg",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date());

    const value = (type: string) =>
      parts.find(part => part.type === type)?.value || "00";

    return {
      year: Number(value("year")),
      month: Number(value("month")),
      day: Number(value("day")),
      hour: Number(value("hour"))
    };
  }

  function getMinimumCollectionDate() {
    const now = getJohannesburgNow();
    const date = new Date(Date.UTC(now.year, now.month - 1, now.day));

    if (now.hour >= 12) {
      date.setUTCDate(date.getUTCDate() + 1);
    }

    return date.toISOString().slice(0, 10);
  }

  function formatCollectionDate(value: string) {
    const [year, month, day] = value.split("-").map(Number);

    return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(
      "en-ZA",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "UTC"
      }
    );
  }

  function generateOrderNumber() {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return String(1000 + (array[0] % 9000));
  }

  function getOrderLines() {
    return selectedItems.map(item => ({
      name: item.name,
      quantity: quantities[item.name],
      price: item.price,
      subtotal: item.price * quantities[item.name]
    }));
  }

  function validateDetails() {
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

    if (collectionDate < getMinimumCollectionDate()) {
      setError("Please select a valid collection date.");
      return false;
    }

    return true;
  }

  // STEP 1: Reserve a unique order number before payment.
  async function reserveOrder() {
    setError("");

    if (!validateDetails()) return;

    if (!supabaseUrl || !supabaseKey) {
      setError("Supabase environment variables are not configured.");
      return;
    }

    setLoading(true);

    try {
      let savedOrder: { id: string; order_number: string } | null = null;
      let lastError: any = null;

      for (let attempt = 0; attempt < 30; attempt++) {
        const candidate = generateOrderNumber();

        const { data, error: insertError } = await supabase
          .from("orders")
          .insert({
            order_number: candidate,
            customer_name: customer.trim(),
            customer_phone: phone.trim(),
            items: getOrderLines(),
            total_amount: total,
            idiyappam_plates: idiyappamPlates,
            collection_date: collectionDate,
            payment_proof_path: null,
            payment_status: "awaiting_payment"
          })
          .select("id, order_number")
          .single();

        if (!insertError && data) {
          savedOrder = data;
          break;
        }

        lastError = insertError;

        if (insertError?.code !== "23505") {
          throw insertError;
        }
      }

      if (!savedOrder) {
        throw lastError || new Error("Could not reserve an order number.");
      }

      setOrderNumber(savedOrder.order_number);
      setReservedOrderId(savedOrder.id);
      setStep("payment");
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Unable to reserve your order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // STEP 2: Upload payment proof and update the reserved order.
  async function submitPaymentProof() {
    setError("");

    if (!reservedOrderId || !orderNumber) {
      setError("Please generate your order number first.");
      return;
    }

    if (
      BANK.account === "REPLACE_WITH_YOUR_FNB_ACCOUNT_NUMBER" ||
      BANK.branch === "REPLACE_WITH_YOUR_BRANCH_CODE"
    ) {
      setError(
        "FNB account number and branch code must be entered before orders can be submitted."
      );
      return;
    }

    if (!proof) {
      setError("Please upload your EFT proof of payment.");
      return;
    }

    if (proof.size > 5 * 1024 * 1024) {
      setError("Payment proof must be 5 MB or smaller.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf"
    ];

    if (!allowedTypes.includes(proof.type)) {
      setError("Please upload a JPG, PNG or PDF file.");
      return;
    }

    setLoading(true);

    let uploadedPath = "";
    let orderUpdated = false;

    try {
      const extension =
        proof.name.split(".").pop()?.toLowerCase() || "jpg";

      uploadedPath =
        `${reservedOrderId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(uploadedPath, proof, {
          contentType: proof.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_proof_path: uploadedPath,
          payment_status: "pending_verification"
        })
        .eq("id", reservedOrderId)
        .eq("order_number", orderNumber);

      if (updateError) throw updateError;

      orderUpdated = true;

      let proofLink = uploadedPath;

      const { data: signedData } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(uploadedPath, 60 * 60 * 24 * 7);

      if (signedData?.signedUrl) {
        proofLink = signedData.signedUrl;
      }

      const orderLines = getOrderLines();

      const message = [
        "ANNAI FOODS - NEW ORDER",
        "",
        `Order number: ${orderNumber}`,
        `EFT payment reference: ${orderNumber}`,
        `Customer: ${customer}`,
        `WhatsApp: ${phone}`,
        `Collection date: ${formatCollectionDate(collectionDate)}`,
        "",
        "ORDER DETAILS:",
        ...orderLines.map(
          item => `${item.name} x ${item.quantity} = R${item.subtotal}`
        ),
        "",
        `Total selected items: ${itemCount}`,
        `Total Idiyappam plates: ${idiyappamPlates}`,
        `GRAND TOTAL: R${total}`,
        "",
        "PAYMENT STATUS: Proof uploaded - awaiting verification",
        `PAYMENT PROOF: ${proofLink}`,
        "",
        "HOME COLLECTION ADDRESS:",
        COLLECTION_ADDRESS,
        "",
        "Please verify the EFT payment before confirming the order.",
        "",
        "Thank you for choosing Annai Foods!"
      ].join("\n");

      setStep("complete");

      window.location.href =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(message);

    } catch (err: any) {
      console.error(err);

      if (uploadedPath && !orderUpdated) {
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([uploadedPath]);
      }

      setError(
        err?.message || "Payment proof upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const buttonStyle = {
    border: "none",
    background: "#75451f",
    color: "white",
    padding: "9px 14px",
    borderRadius: "8px",
    fontSize: "17px",
    fontWeight: "bold" as const,
    cursor: "pointer"
  };

  const fieldStyle = {
    width: "100%",
    padding: "13px",
    margin: "7px 0 15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    boxSizing: "border-box" as const
  };

  const cardStyle = {
    background: "white",
    borderRadius: "14px",
    padding: "17px",
    marginBottom: "15px",
    boxShadow: "0 2px 8px #0000000c"
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff8ed",
        padding: "20px 14px",
        fontFamily: "Arial, sans-serif",
        color: "#352315"
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
            boxShadow: "0 5px 18px #174b2110"
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
              borderRadius: "50%"
            }}
          />

          <h1 style={{ color: "#075b20", fontSize: "30px" }}>
            Welcome to Annai Foods ❤️
          </h1>

          <h3 style={{ color: "#397c2c" }}>
            Fresh Homemade Idiyappam · Made with Love
          </h3>

          <p>Choose your food, review your cart and pay by EFT.</p>
        </header>

        <section style={cardStyle}>
          <h2>Our Food Menu</h2>

          <p style={{ color: "#a04b24" }}>
            Minimum 5 plates of Idiyappam per order.
          </p>

          {MENU.map(item => (
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
                  <div style={{ fontSize: "12px", color: "#777" }}>
                    {item.description}
                  </div>
                )}

                <div style={{ color: "#75451f", fontWeight: "bold" }}>
                  R{item.price}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <button
                  style={buttonStyle}
                  disabled={step !== "details"}
                  onClick={() => changeQuantity(item.name, -1)}
                >
                  −
                </button>

                <strong>{quantities[item.name] || 0}</strong>

                <button
                  style={buttonStyle}
                  disabled={step !== "details"}
                  onClick={() => changeQuantity(item.name, 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </section>

        <section style={{ ...cardStyle, border: "2px solid #218838" }}>
          <h2>🛒 Your Shopping Cart</h2>

          {selectedItems.length === 0 ? (
            <p style={{ color: "#777" }}>
              Your cart is empty. Please select food from the menu.
            </p>
          ) : (
            selectedItems.map(item => (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #eee"
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

                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <button
                    style={buttonStyle}
                    disabled={step !== "details"}
                    onClick={() => changeQuantity(item.name, -1)}
                  >
                    −
                  </button>

                  <strong>{quantities[item.name]}</strong>

                  <button
                    style={buttonStyle}
                    disabled={step !== "details"}
                    onClick={() => changeQuantity(item.name, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}

          <p>Total selected items: <strong>{itemCount}</strong></p>
          <p>Total Idiyappam plates: <strong>{idiyappamPlates}</strong></p>

          <h2 style={{ color: "#218838" }}>
            Grand Total: R{total}
          </h2>
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
            disabled={step !== "details"}
            onChange={e => setCustomer(e.target.value)}
          />

          <label>WhatsApp Number</label>

          <input
            style={fieldStyle}
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            disabled={step !== "details"}
            onChange={e => setPhone(e.target.value)}
          />

          <label>Collection Date</label>

          <input
            style={fieldStyle}
            type="date"
            min={getMinimumCollectionDate()}
            value={collectionDate}
            disabled={step !== "details"}
            onChange={e => {
              setCollectionDate(e.target.value);
              setError("");
            }}
          />

          <p style={{ color: "#397c2c", fontSize: "14px" }}>
            {getJohannesburgNow().hour >= 12
              ? "Today's collection is closed. Select tomorrow or any future date."
              : "Select today before 12 PM or any future date."}
          </p>

          <p><strong>Collection:</strong> Home collection only</p>
          <p><strong>Order cutoff:</strong> 12:00 PM Johannesburg time</p>

          {step === "details" && (
            <button
              onClick={reserveOrder}
              disabled={loading}
              style={{
                ...buttonStyle,
                width: "100%",
                padding: "16px",
                background: "#218838"
              }}
            >
              {loading ? "Generating order number..." : "Continue to EFT Payment"}
            </button>
          )}
        </section>

        {step === "payment" && (
          <section style={{ ...cardStyle, border: "2px solid #218838" }}>
            <h2>🏦 FNB EFT Payment</h2>

            <div
              style={{
                background: "#eaf5e9",
                borderRadius: "12px",
                padding: "16px",
                textAlign: "center"
              }}
            >
              <p>Your unique order number</p>

              <h1 style={{ color: "#075b20", fontSize: "38px" }}>
                {orderNumber}
              </h1>

              <p>
                Use this 4-digit number as your EFT payment reference.
              </p>
            </div>

            <h3>Bank Account Details</h3>

            <p><strong>Bank:</strong> {BANK.name}</p>
            <p><strong>Account holder:</strong> {BANK.holder}</p>
            <p><strong>Account number:</strong> {BANK.account}</p>
            <p><strong>Account type:</strong> {BANK.type}</p>
            <p><strong>Branch code:</strong> {BANK.branch}</p>

            <h2 style={{ color: "#218838" }}>
              Amount to Pay: R{total}
            </h2>

            <p>
              Please pay the full amount using your order number as the
              payment reference. Your order will remain subject to payment
              verification.
            </p>

            <hr />

            <h3>Upload Proof of Payment</h3>

            <input
              style={fieldStyle}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={e => {
                setProof(e.target.files?.[0] || null);
                setError("");
              }}
            />

            {proof && (
              <p style={{ color: "#218838" }}>
                Selected file: {proof.name}
              </p>
            )}

            <p style={{ fontSize: "13px", color: "#777" }}>
              Accepted formats: JPG, PNG and PDF. Maximum size: 5 MB.
            </p>

            <button
              onClick={submitPaymentProof}
              disabled={loading || !proof}
              style={{
                ...buttonStyle,
                width: "100%",
                padding: "16px",
                background: "#218838",
                opacity: loading || !proof ? 0.6 : 1
              }}
            >
              {loading
                ? "Uploading payment proof..."
                : "Submit Order & Send WhatsApp Notification"}
            </button>
          </section>
        )}

        {step === "complete" && (
          <section style={cardStyle}>
            <h2 style={{ color: "#218838" }}>
              Order Submitted Successfully!
            </h2>
            <p>Your order number is: <strong>{orderNumber}</strong></p>
            <p>
              Your payment proof has been uploaded.
              Payment verification is pending.
            </p>
          </section>
        )}

        {error && (
          <div
            style={{
              background: "#ffe5e5",
              color: "#b00020",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "15px"
            }}
          >
            {error}
          </div>
        )}

        <footer
          style={{
            textAlign: "center",
            padding: "20px",
            color: "#75451f"
          }}
        >
          <p>
            Thank you for choosing Annai Foods ❤️
          </p>
          <p>Fresh Homemade Idiyappam · Made with Love</p>
        </footer>
      </div>
    </main>
  );
}
