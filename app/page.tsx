"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";

// ==========================================
// TYPES
// ==========================================

type MenuItem = {
  name: string;
  price: number;
  type?: "idiyappam" | "combo" | "party";
  description?: string;
  unit?: string;
};

type CollectionMethod = "Home collection" | "Uber pickup";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
};

type CustomerReview = {
  id: string;
  display_name: string | null;
  rating: number;
  review: string;
  created_at: string;
};

// ==========================================
// MENU CATEGORIES
// ==========================================

const IDIYAPPAM_MENU: MenuItem[] = [
  { name: "Rice Idiyappam", price: 30, type: "idiyappam" },
  { name: "Ragi Idiyappam", price: 35, type: "idiyappam" },
  { name: "Wheat Idiyappam", price: 35, type: "idiyappam" },
  {
    name: "Sweet Rice Idiyappam",
    price: 45,
    type: "idiyappam",
    unit: "per portion",
  },
  {
    name: "Sweet Ragi Idiyappam",
    price: 45,
    type: "idiyappam",
    unit: "per portion",
  },
  { name: "Egg Idiyappam Kothu", price: 80 },
  { name: "Chicken Idiyappam Kothu", price: 100 },
];

const GRAVY_MENU: MenuItem[] = [
  { name: "Lamb Kurma / Gravy", price: 140 },
  { name: "Chicken Kurma / Gravy", price: 100 },
  { name: "Egg Kurma", price: 90 },
  { name: "Veg White Kurma", price: 80 },
  { name: "Attukal Paya", price: 125, unit: "per portion" },
];

const COMBO_MENU: MenuItem[] = [
  {
    name: "Combo 1",
    price: 140,
    type: "combo",
    description: "2 plates Idiyappam + 1 portion Chicken Gravy",
  },
  {
    name: "Combo 2",
    price: 125,
    type: "combo",
    description: "2 plates Idiyappam + Veg White Kurma",
  },
];

const SIDES_MENU: MenuItem[] = [
  { name: "Coconut Milk", price: 50 },
];

const PARTY_MENU: MenuItem[] = [
  {
    name: "Chennai Style Lamb Dum Biryani with Egg",
    price: 140,
    type: "party",
    unit: "per plate",
  },
  {
    name: "Chennai Style Chicken Dum Biryani with Egg",
    price: 110,
    type: "party",
    unit: "per plate",
  },
];

const MENU: MenuItem[] = [
  ...IDIYAPPAM_MENU,
  ...GRAVY_MENU,
  ...COMBO_MENU,
  ...SIDES_MENU,
];

const ALL_MENU: MenuItem[] = [...MENU, ...PARTY_MENU];

const COLLECTION_ADDRESS =
  "Unit 23, Fairview Crescent, Wood County Estate, Midrand, Johannesburg";

const WHATSAPP_NUMBERS = [
  "27651188768",
  "27607104011",
];

// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// ==========================================
// DATE HELPERS
// ==========================================

function johannesburgParts(date = new Date()): Record<string, string> {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const result: Record<string, string> = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }
  });

  return result;
}

function minimumCollectionDate(): string {
  const parts = johannesburgParts();

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (hour >= 12) {
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function isValidCalendarDate(value: string): boolean {
  if (!value) return false;

  const parts = value.split("-").map(Number);

  if (parts.length !== 3) return false;

  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function formatDate(value: string): string {
  if (!value) return "";

  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
}

// ==========================================
// UNIQUE FOUR-DIGIT ORDER NUMBER
// ==========================================

function generateOrderNumber(): string {
  const randomNumber = new Uint32Array(1);

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomNumber);

    return String(1000 + (randomNumber[0] % 9000));
  }

  return String(Math.floor(1000 + Math.random() * 9000));
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function Home() {
  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseKey) {
      return null;
    }

    return createClient(supabaseUrl, supabaseKey);
  }, []);

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");

  const [collectionDate, setCollectionDate] = useState(
    minimumCollectionDate()
  );

  const [collectionMethod, setCollectionMethod] =
    useState<CollectionMethod>("Home collection");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");

  // ==========================================
  // CUSTOMER REVIEW STATE
  // ==========================================

  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  const [approvedReviews, setApprovedReviews] =
    useState<CustomerReview[]>([]);

  // ==========================================
  // LOAD APPROVED CUSTOMER REVIEWS
  // ==========================================

  useEffect(() => {
    if (!supabase) return;

    let active = true;

    async function loadApprovedReviews() {
      const { data, error } = await supabase!
        .from("customer_reviews")
        .select("id, display_name, rating, review, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!active) return;

      if (error) {
        console.error("Unable to load reviews:", error);
        return;
      }

      setApprovedReviews((data || []) as CustomerReview[]);
    }

    loadApprovedReviews();

    return () => {
      active = false;
    };
  }, [supabase]);

  // ==========================================
  // SUBMIT CUSTOMER REVIEW
  // ==========================================

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setReviewError("");
    setReviewMessage("");

    if (!supabase) {
      setReviewError("The review system is currently unavailable.");
      return;
    }

    if (!reviewName.trim()) {
      setReviewError("Please enter your name.");
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError("Please select a star rating.");
      return;
    }

    if (reviewText.trim().length < 5) {
      setReviewError("Please write at least 5 characters in your review.");
      return;
    }

    if (reviewText.trim().length > 1000) {
      setReviewError("Your review must be 1000 characters or less.");
      return;
    }

    setReviewLoading(true);

    try {
      const { error: insertError } = await supabase
        .from("customer_reviews")
        .insert({
          display_name: reviewName.trim(),
          rating: reviewRating,
          review: reviewText.trim(),
          status: "pending",
        });

      if (insertError) {
        console.error("Review submission error:", insertError);
        throw new Error("Unable to submit your review. Please try again.");
      }

      setReviewMessage(
        "Thank you for sharing your experience! Your review has been submitted and will appear publicly after Annai Foods approves it."
      );

      setReviewName("");
      setReviewRating(5);
      setReviewText("");
    } catch (err: unknown) {
      setReviewError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setReviewLoading(false);
    }
  }

  // ==========================================
  // CART CALCULATIONS
  // ==========================================

  const selectedItems = useMemo(() => {
    return ALL_MENU
      .filter((item) => Number(quantities[item.name] || 0) > 0)
      .map((item) => {
        const quantity = Number(quantities[item.name]);

        return {
          ...item,
          quantity,
          subtotal: item.price * quantity,
        };
      });
  }, [quantities]);

  const selectedRegularItems = selectedItems.filter(
    (item) => item.type !== "party"
  );

  const selectedPartyItems = selectedItems.filter(
    (item) => item.type === "party"
  );

  const total = selectedItems.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  const itemCount = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const idiyappamPlates = selectedRegularItems.reduce(
    (sum, item) => {
      if (item.type === "idiyappam") {
        return sum + item.quantity;
      }

      if (item.type === "combo") {
        return sum + item.quantity * 2;
      }

      return sum;
    },
    0
  );

  const partyPlateCount = selectedPartyItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  function updateQuantity(itemName: string, change: number) {
    setQuantities((previous) => {
      const current = Number(previous[itemName] || 0);
      const next = Math.max(0, current + change);

      return {
        ...previous,
        [itemName]: next,
      };
    });

    setSubmittedOrderNumber("");
    setWhatsappMessage("");
    setError("");
  }

  // ==========================================
  // VALIDATION
  // ==========================================

  function validate(): string {
    if (!supabase) {
      return "The order system is not configured. Please contact Annai Foods.";
    }

    if (!customer.trim()) {
      return "Please enter your name.";
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      return "Please enter a valid 10-digit South African phone number.";
    }

    if (selectedItems.length === 0) {
      return "Please select at least one menu item.";
    }

    // Combo 1 or Combo 2 can be ordered on their own.
    // The 5-plate minimum still applies to normal Idiyappam orders.
    const hasCombo = selectedRegularItems.some(
      (item) => item.type === "combo"
    );

    const hasRegularIdiyappam = selectedRegularItems.some(
      (item) => item.type === "idiyappam"
    );

    if (
      hasRegularIdiyappam &&
      !hasCombo &&
      idiyappamPlates < 5
    ) {
      return "The minimum regular order is 5 plates of Idiyappam. Combos count as 2 plates each.";
    }

    if (
      selectedPartyItems.length > 0 &&
      partyPlateCount < 5
    ) {
      return "The minimum biryani order is 5 plates. You can mix Lamb and Chicken Biryani.";
    }

    if (!isValidCalendarDate(collectionDate)) {
      return "Please select a valid collection date.";
    }

    if (collectionDate < minimumCollectionDate()) {
      return "Please select an available collection date.";
    }

    if (
      collectionMethod !== "Home collection" &&
      collectionMethod !== "Uber pickup"
    ) {
      return "Please select a collection method.";
    }

    return "";
  }

  // ==========================================
  // CREATE WHATSAPP MESSAGE
  // ==========================================

  function createWhatsAppMessage(orderNumber: string): string {
    const lines: string[] = [];

    lines.push("ANNAI FOODS - NEW ORDER");
    lines.push("========================");
    lines.push(`Order Number: ${orderNumber}`);
    lines.push("");

    lines.push(`Customer: ${customer.trim()}`);
    lines.push(`Phone: ${phone.trim()}`);
    lines.push(`Collection Date: ${formatDate(collectionDate)}`);
    lines.push(`Collection Method: ${collectionMethod}`);

    lines.push("");
    lines.push("ORDER DETAILS");
    lines.push("------------------------");

    selectedItems.forEach((item) => {
      lines.push(
        `${item.name} x ${item.quantity} = R${item.subtotal.toFixed(2)}`
      );
    });

    lines.push("");
    lines.push(`Total Items: ${itemCount}`);
    lines.push(`Total Idiyappam Plates: ${idiyappamPlates}`);

    if (selectedPartyItems.length > 0) {
      lines.push(`Total Biryani Plates: ${partyPlateCount}`);
    }

    lines.push("");
    lines.push(`TOTAL AMOUNT: R${total.toFixed(2)}`);
    lines.push("");

    lines.push(`Collection Address: ${COLLECTION_ADDRESS}`);

    if (collectionMethod === "Uber pickup") {
      lines.push("");
      lines.push(
        "Customer will arrange an Uber driver to collect the order from the collection address. Uber charges are the customer's responsibility."
      );
    }

    lines.push("");
    lines.push("Thank you for ordering from Annai Foods!");

    return lines.join("\n");
  }

  // ==========================================
  // SUBMIT ORDER
  // ==========================================

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setLoading(true);

    try {
      let savedOrder = false;
      let orderNumber = "";
      let lastError: { message: string; code?: string } | null = null;

      const orderItems: OrderItem[] = selectedItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      }));

      for (let attempt = 0; attempt < 30; attempt++) {
        orderNumber = generateOrderNumber();

        const { error: insertError } = await supabase
          .from("orders")
          .insert({
            order_number: orderNumber,
            customer_name: customer.trim(),
            customer_phone: phone.trim(),
            items: orderItems,
            total_amount: total,
            idiyappam_plates: idiyappamPlates,
            collection_date: collectionDate,
            collection_method: collectionMethod,
          });

        if (!insertError) {
          savedOrder = true;
          break;
        }

        lastError = insertError;

        if (insertError.code !== "23505") {
          break;
        }
      }

      if (!savedOrder) {
        console.error("Order saving error:", lastError);

        throw new Error(
          lastError?.message ||
          "Unable to save your order. Please try again."
        );
      }

      const message = createWhatsAppMessage(orderNumber);

      setSubmittedOrderNumber(orderNumber);
      setWhatsappMessage(message);

    } catch (err: unknown) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while submitting your order."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // STYLES
  // ==========================================

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#fff8ef",
      padding: "16px",
      color: "#35251b",
      fontFamily: "Arial, sans-serif",
    },

    container: {
      maxWidth: "760px",
      margin: "0 auto",
    },

    header: {
      textAlign: "center" as const,
      padding: "20px 10px",
      background: "#ffffff",
      borderRadius: "16px",
      marginBottom: "18px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    },

    section: {
      background: "#ffffff",
      borderRadius: "14px",
      padding: "18px",
      marginBottom: "16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },

    heading: {
      color: "#8b3f16",
      marginTop: 0,
      marginBottom: "14px",
      fontSize: "20px",
      textTransform: "uppercase" as const,
    },

    menuItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "10px",
      padding: "12px 0",
      borderBottom: "1px solid #eee5dc",
    },

    button: {
      border: "none",
      background: "#8b3f16",
      color: "#ffffff",
      borderRadius: "8px",
      padding: "9px 13px",
      fontSize: "17px",
      fontWeight: "bold",
      cursor: "pointer",
    },

    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #d8c8b8",
      borderRadius: "8px",
      fontSize: "16px",
      boxSizing: "border-box" as const,
      marginTop: "6px",
      marginBottom: "14px",
    },

    label: {
      display: "block",
      fontWeight: "bold",
      marginTop: "10px",
    },
  };

  // ==========================================
  // MENU DISPLAY
  // ==========================================

  function renderMenuItem(item: MenuItem) {
    const quantity = Number(quantities[item.name] || 0);

    return (
      <div key={item.name} style={styles.menuItem}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "bold" }}>
            {item.name}
          </div>

          {item.description && (
            <div
              style={{
                fontSize: "13px",
                color: "#777",
                marginTop: "3px",
              }}
            >
              {item.description}
            </div>
          )}

          <div
            style={{
              color: "#8b3f16",
              fontWeight: "bold",
              marginTop: "5px",
            }}
          >
            R{item.price}
            {item.unit
              ? ` / ${item.unit.replace("per ", "")}`
              : ""}
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
            style={styles.button}
            onClick={() => updateQuantity(item.name, -1)}
            aria-label={`Remove one ${item.name}`}
          >
            −
          </button>

          <span
            style={{
              minWidth: "18px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {quantity}
          </span>

          <button
            type="button"
            style={styles.button}
            onClick={() => updateQuantity(item.name, 1)}
            aria-label={`Add one ${item.name}`}
          >
            +
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <main style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}

        <header style={styles.header}>
          <img
            src="/annai-foods-logo.jpg"
            alt="Annai Foods Logo"
            style={{
              width: "125px",
              height: "125px",
              objectFit: "contain",
              marginBottom: "8px",
            }}
          />

          <h1 style={{ color: "#8b3f16", margin: "5px 0" }}>
            Welcome to Annai Foods
          </h1>

          <p style={{ margin: "8px 0", color: "#665346" }}>
            Delicious homemade food, prepared with love.
          </p>

          <p style={{ fontWeight: "bold", color: "#a33c1a" }}>
            Minimum order: 5 plates of Idiyappam
          </p>

          <p style={{ fontSize: "13px", color: "#665346" }}>
            Biryani minimum order: 5 plates. Orders before 12:00 PM
            for same-day collection, subject to availability.
          </p>
        </header>

        {/* VARIETIES OF IDIYAPPAM */}

        <section style={styles.section}>
          <h2 style={styles.heading}>
            Varieties of Idiyappam
          </h2>

          {IDIYAPPAM_MENU.map(renderMenuItem)}
        </section>

        {/* GRAVY AND KURMA */}

        <section style={styles.section}>
          <h2 style={styles.heading}>
            Gravy & Kurma
          </h2>

          {GRAVY_MENU.map(renderMenuItem)}
        </section>

        {/* COMBOS */}

        <section style={styles.section}>
          <h2 style={styles.heading}>
            Combos
          </h2>

          {COMBO_MENU.map(renderMenuItem)}
        </section>

        {/* SIDES */}

        <section style={styles.section}>
          <h2 style={styles.heading}>
            Sides
          </h2>

          {SIDES_MENU.map(renderMenuItem)}
        </section>

        {/* PARTY MENU */}

        <section style={styles.section}>
          <h2 style={styles.heading}>
            Party Menu – Chennai Style Dum Biryani
          </h2>

          <p style={{ fontSize: "14px", color: "#665346" }}>
            Minimum 5 plates. You can mix Lamb and Chicken Biryani.
          </p>

          {PARTY_MENU.map(renderMenuItem)}
        </section>

        {/* CART */}

        <section style={styles.section}>
          <h2 style={styles.heading}>Your Order</h2>

          {selectedItems.length === 0 ? (
            <p style={{ color: "#777" }}>
              Your cart is empty. Please select items from the menu.
            </p>
          ) : (
            selectedItems.map((item) => (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  padding: "8px 0",
                  borderBottom: "1px solid #eee5dc",
                }}
              >
                <span>
                  {item.name} x {item.quantity}
                </span>

                <strong>
                  R{item.subtotal.toFixed(2)}
                </strong>
              </div>
            ))
          )}

          <div style={{ marginTop: "14px", lineHeight: 1.8 }}>
            <div>
              Total Items: <strong>{itemCount}</strong>
            </div>

            <div>
              Total Idiyappam Plates:{" "}
              <strong>{idiyappamPlates}</strong>
            </div>

            {selectedPartyItems.length > 0 && (
              <div>
                Total Biryani Plates:{" "}
                <strong>{partyPlateCount}</strong>
              </div>
            )}

            <h2 style={{ color: "#8b3f16" }}>
              Grand Total: R{total.toFixed(2)}
            </h2>
          </div>
        </section>

        {/* COLLECTION DETAILS */}

        <section style={styles.section}>
          <h2 style={styles.heading}>Collection Details</h2>

          <p style={{ fontWeight: "bold" }}>
            Collection Address:
          </p>

          <p>{COLLECTION_ADDRESS}</p>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Unit+23+Fairview+Crescent+Wood+County+Estate+Midrand+Johannesburg"
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#8b3f16",
              fontWeight: "bold",
            }}
          >
            View collection address on Google Maps
          </a>

          <label style={styles.label}>
            Collection Date
          </label>

          <input
            type="date"
            value={collectionDate}
            min={minimumCollectionDate()}
            onChange={(event) => {
              setCollectionDate(event.target.value);
              setSubmittedOrderNumber("");
              setWhatsappMessage("");
            }}
            style={styles.input}
            required
          />

          <label style={styles.label}>
            Collection Method
          </label>

          <label style={{ display: "block", margin: "12px 0" }}>
            <input
              type="radio"
              name="collectionMethod"
              value="Home collection"
              checked={collectionMethod === "Home collection"}
              onChange={(event) => {
                setCollectionMethod(event.target.value as CollectionMethod);
                setSubmittedOrderNumber("");
                setWhatsappMessage("");
              }}
            />
            {" "}Home collection
          </label>

          <label style={{ display: "block", margin: "12px 0" }}>
            <input
              type="radio"
              name="collectionMethod"
              value="Uber pickup"
              checked={collectionMethod === "Uber pickup"}
              onChange={(event) => {
                setCollectionMethod(event.target.value as CollectionMethod);
                setSubmittedOrderNumber("");
                setWhatsappMessage("");
              }}
            />
            {" "}Uber pickup
          </label>

          <p style={{ fontSize: "13px", color: "#665346" }}>
            For Uber pickup, the customer must arrange the Uber driver
            to collect from the address above. Uber charges are the
            customer's responsibility.
          </p>
        </section>

        {/* CUSTOMER DETAILS AND SUBMISSION */}

        <form onSubmit={submitOrder}>
          <section style={styles.section}>
            <h2 style={styles.heading}>Customer Details</h2>

            <label style={styles.label}>
              Full Name
            </label>

            <input
              type="text"
              value={customer}
              onChange={(event) => {
                setCustomer(event.target.value);
                setSubmittedOrderNumber("");
                setWhatsappMessage("");
              }}
              placeholder="Enter your full name"
              style={styles.input}
              required
            />

            <label style={styles.label}>
              WhatsApp / Contact Number
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setSubmittedOrderNumber("");
                setWhatsappMessage("");
              }}
              placeholder="e.g. 0712345678"
              maxLength={10}
              style={styles.input}
              required
            />

            {error && (
              <div
                role="alert"
                style={{
                  background: "#ffeded",
                  color: "#a00000",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "14px",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || Boolean(submittedOrderNumber)}
              style={{
                ...styles.button,
                width: "100%",
                padding: "15px",
                fontSize: "17px",
                opacity:
                  loading || submittedOrderNumber ? 0.6 : 1,
              }}
            >
              {loading
                ? "Submitting Order..."
                : submittedOrderNumber
                ? "Order Submitted"
                : "Submit Order"}
            </button>
          </section>
        </form>

        {/* WHATSAPP NOTIFICATIONS */}

        {submittedOrderNumber && (
          <section style={styles.section}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ color: "#218838" }}>
                Your Order Has Been Saved!
              </h2>

              <p>Your unique order number is:</p>

              <h1
                style={{
                  color: "#8b3f16",
                  fontSize: "36px",
                }}
              >
                {submittedOrderNumber}
              </h1>

              <p>
                Please send your order details to Annai Foods on WhatsApp.
              </p>

              {WHATSAPP_NUMBERS.map((number) => (
                <a
                  key={number}
                  href={`https://wa.me/${number}?text=${encodeURIComponent(
                    whatsappMessage
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    background: "#25D366",
                    color: "#ffffff",
                    textDecoration: "none",
                    padding: "14px",
                    borderRadius: "9px",
                    fontWeight: "bold",
                    marginTop: "12px",
                  }}
                >
                  Send Order on WhatsApp -{" "}
                  {number === "27651188768"
                    ? "065 118 8768"
                    : "060 710 4011"}
                </a>
              ))}

              <p
                style={{
                  fontSize: "13px",
                  color: "#665346",
                  marginTop: "15px",
                }}
              >
                Please press Send in WhatsApp to deliver your order
                notification. Your order is saved in our system, but
                the WhatsApp messages must be sent manually.
              </p>
            </div>
          </section>
        )}

        {/* ======================================
            ANNAI FOODS CUSTOMER REVIEW SYSTEM
        ====================================== */}

        <section style={styles.section}>
          <h2 style={styles.heading}>
            Share Your Experience
          </h2>

          <p style={{ color: "#665346", lineHeight: 1.6 }}>
            Have you enjoyed our food? We would love to hear from you!
            Please rate your experience and share your feedback.
          </p>

          <form onSubmit={submitReview}>
            <label style={styles.label}>
              Your Name
            </label>

            <input
              type="text"
              value={reviewName}
              onChange={(event) => setReviewName(event.target.value)}
              placeholder="Enter your name"
              maxLength={80}
              style={styles.input}
              required
            />

            <label style={styles.label}>
              Your Rating
            </label>

            <div
              style={{
                display: "flex",
                gap: "8px",
                margin: "12px 0 18px",
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate ${star} out of 5 stars`}
                  aria-pressed={reviewRating === star}
                  onClick={() => setReviewRating(star)}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "2px",
                    cursor: "pointer",
                    fontSize: "34px",
                    color:
                      star <= reviewRating ? "#E6A323" : "#d5d5d5",
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            <p
              style={{
                color: "#8b3f16",
                fontWeight: "bold",
                marginTop: "-10px",
              }}
            >
              {reviewRating} out of 5 stars
            </p>

            <label style={styles.label}>
              Your Feedback
            </label>

            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              placeholder="Tell us what you enjoyed about your Annai Foods experience..."
              maxLength={1000}
              rows={5}
              required
              style={{
                ...styles.input,
                resize: "vertical",
                fontFamily: "Arial, sans-serif",
              }}
            />

            <p
              style={{
                fontSize: "12px",
                color: "#806d5f",
                textAlign: "right",
                marginTop: "-10px",
              }}
            >
              {reviewText.length}/1000 characters
            </p>

            {reviewError && (
              <div
                role="alert"
                style={{
                  background: "#ffeded",
                  color: "#a00000",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "14px",
                }}
              >
                {reviewError}
              </div>
            )}

            {reviewMessage && (
              <div
                role="status"
                style={{
                  background: "#eaf7ed",
                  color: "#216b35",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "14px",
                  lineHeight: 1.5,
                }}
              >
                {reviewMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={reviewLoading}
              style={{
                ...styles.button,
                width: "100%",
                padding: "14px",
                opacity: reviewLoading ? 0.6 : 1,
              }}
            >
              {reviewLoading
                ? "Submitting Review..."
                : "Submit My Review"}
            </button>
          </form>
        </section>

        {/* ======================================
            APPROVED CUSTOMER REVIEWS
        ====================================== */}

        <section style={styles.section}>
          <h2 style={styles.heading}>
            What Our Customers Say
          </h2>

          <p style={{ color: "#665346", marginTop: "-5px" }}>
            Real feedback shared by our customers.
          </p>

          {approvedReviews.length > 0 && (
            <div>
              {approvedReviews.map((review) => (
                <article
                  key={review.id}
                  style={{
                    borderBottom: "1px solid #eee5dc",
                    padding: "15px 0",
                  }}
                >
                  <div
                    style={{
                      color: "#E6A323",
                      fontSize: "22px",
                      letterSpacing: "2px",
                    }}
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {"★".repeat(review.rating)}
                    <span style={{ color: "#d5d5d5" }}>
                      {"★".repeat(5 - review.rating)}
                    </span>
                  </div>

                  <p
                    style={{
                      lineHeight: 1.6,
                      margin: "8px 0",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {review.review}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "8px",
                      flexWrap: "wrap",
                      fontSize: "13px",
                      color: "#806d5f",
                    }}
                  >
                    <strong>
                      {review.display_name || "Annai Foods Customer"}
                    </strong>

                    <span>
                      {new Date(review.created_at).toLocaleDateString(
                        "en-ZA",
                        { timeZone: "Africa/Johannesburg" }
                      )}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}

        <footer
          style={{
            textAlign: "center",
            padding: "20px",
            color: "#806d5f",
          }}
        >
          <strong>
            Thank you for choosing Annai Foods!
          </strong>
        </footer>

      </div>
    </main>
  );
}
