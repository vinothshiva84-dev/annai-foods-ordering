"use client";

import { useMemo, useState, type FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";

// ======================================================
// SUPABASE
// ======================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);

// ======================================================
// TYPES
// ======================================================

type MenuItem = {
  name: string;
  price: number;
  type?: "idiyappam" | "combo" | "party";
  description?: string;
};

type CartItem = MenuItem & {
  quantity: number;
};

// ======================================================
// MENU
// ======================================================

const MENU: MenuItem[] = [
  // REGULAR IDIYAPPAM
  {
    name: "Rice Idiyappam",
    price: 30,
    type: "idiyappam",
    description: "Fresh homemade rice idiyappam",
  },
  {
    name: "Ragi Idiyappam",
    price: 35,
    type: "idiyappam",
    description: "Healthy homemade ragi idiyappam",
  },
  {
    name: "Wheat Idiyappam",
    price: 35,
    type: "idiyappam",
    description: "Fresh homemade wheat idiyappam",
  },
  {
    name: "Sweet Rice Idiyappam",
    price: 45,
    type: "idiyappam",
    description: "Sweet rice idiyappam",
  },
  {
    name: "Sweet Ragi Idiyappam",
    price: 45,
    type: "idiyappam",
    description: "Sweet ragi idiyappam",
  },

  // KOTHU
  {
    name: "Egg Idiyappam Kothu",
    price: 80,
    description: "Egg idiyappam kothu",
  },
  {
    name: "Chicken Idiyappam Kothu",
    price: 100,
    description: "Chicken idiyappam kothu",
  },

  // GRAVY & KURMA
  {
    name: "Lamb Kurma / Gravy",
    price: 140,
    description: "Homemade lamb kurma / gravy",
  },
  {
    name: "Chicken Kurma / Gravy",
    price: 100,
    description: "Homemade chicken kurma / gravy",
  },
  {
    name: "Egg Kurma",
    price: 90,
    description: "Homemade egg kurma",
  },
  {
    name: "Veg White Kurma",
    price: 80,
    description: "Creamy vegetarian white kurma",
  },
  {
    name: "Attukal Paya",
    price: 125,
    description: "Traditional homemade attukal paya",
  },

  // COMBOS
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

  // SIDES
  {
    name: "Coconut Milk",
    price: 50,
    description: "Fresh coconut milk",
  },

  // PARTY MENU
  {
    name: "Chennai Style Lamb Dum Biryani with Egg",
    price: 140,
    type: "party",
    description: "Chennai-style lamb dum biryani with egg",
  },
  {
    name: "Chennai Style Chicken Dum Biryani with Egg",
    price: 110,
    type: "party",
    description: "Chennai-style chicken dum biryani with egg",
  },
];

// ======================================================
// CONSTANTS
// ======================================================

const COLLECTION_ADDRESS =
  "Unit 23, Fairview Crescent, Wood County Estate, Midrand, Johannesburg";

const WHATSAPP_NUMBERS = [
  "27651188768",
  "27607104011",
];

// ======================================================
// DATE HELPERS
// ======================================================

function getJohannesburgDateParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    second: Number(get("second")),
  };
}

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMinimumCollectionDate() {
  const now = getJohannesburgDateParts();

  const today = new Date(
    now.year,
    now.month - 1,
    now.day
  );

  if (now.hour < 12) {
    return formatDateForInput(today);
  }

  today.setDate(today.getDate() + 1);

  return formatDateForInput(today);
}

function formatDisplayDate(dateString: string) {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-");

  return `${day}/${month}/${year}`;
}

// ======================================================
// COMPONENT
// ======================================================

export default function Home() {
  const [quantities, setQuantities] =
    useState<Record<string, number>>({});

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [collectionDate, setCollectionDate] =
    useState(getMinimumCollectionDate());

  const [collectionMethod, setCollectionMethod] =
    useState<"Home collection" | "Uber pickup">(
      "Home collection"
    );

  const [loading, setLoading] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  // ====================================================
  // CART
  // ====================================================

  const cartItems: CartItem[] = useMemo(() => {
    return MENU
      .filter(
        (item) =>
          (quantities[item.name] || 0) > 0
      )
      .map((item) => ({
        ...item,
        quantity: quantities[item.name],
      }));
  }, [quantities]);

  // ====================================================
  // TOTALS
  // ====================================================

  const totalAmount = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const totalSelectedItems = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
  }, [cartItems]);

  const totalIdiyappamPlates = useMemo(() => {
    return cartItems.reduce(
      (total, item) => {
        if (item.type === "idiyappam") {
          return total + item.quantity;
        }

        if (item.type === "combo") {
          return total + item.quantity * 2;
        }

        return total;
      },
      0
    );
  }, [cartItems]);

  const totalPartyBiryaniPlates = useMemo(() => {
    return cartItems.reduce(
      (total, item) => {
        if (item.type === "party") {
          return total + item.quantity;
        }

        return total;
      },
      0
    );
  }, [cartItems]);

  const hasRegularItems = cartItems.some(
    (item) => item.type !== "party"
  );

  const hasPartyItems = cartItems.some(
    (item) => item.type === "party"
  );

  // ====================================================
  // QUANTITY
  // ====================================================

  function increaseQuantity(itemName: string) {
    setQuantities((previous) => ({
      ...previous,
      [itemName]:
        (previous[itemName] || 0) + 1,
    }));
  }

  function decreaseQuantity(itemName: string) {
    setQuantities((previous) => {
      const current =
        previous[itemName] || 0;

      if (current <= 1) {
        const updated = {
          ...previous,
        };

        delete updated[itemName];

        return updated;
      }

      return {
        ...previous,
        [itemName]: current - 1,
      };
    });
  }

  // ====================================================
  // PHONE
  // ====================================================

  function handlePhoneChange(value: string) {
    const digitsOnly = value
      .replace(/\D/g, "")
      .slice(0, 10);

    setCustomerPhone(digitsOnly);
  }

  // ====================================================
  // VALIDATION
  // ====================================================

  function validateOrder() {
    if (!customerName.trim()) {
      return "Please enter your name.";
    }

    if (!/^\d{10}$/.test(customerPhone)) {
      return "Please enter a valid 10-digit South African phone number.";
    }

    if (!collectionDate) {
      return "Please select a collection date.";
    }

    const minimumDate =
      getMinimumCollectionDate();

    if (collectionDate < minimumDate) {
      return "The selected collection date is no longer available. Please select another date.";
    }

    if (cartItems.length === 0) {
      return "Please select at least one menu item.";
    }

    if (
      hasRegularItems &&
      totalIdiyappamPlates < 5
    ) {
      return "The minimum regular order is 5 plates of Idiyappam. Combos count as 2 plates each.";
    }

    if (
      hasPartyItems &&
      totalPartyBiryaniPlates < 5
    ) {
      return "The minimum party order is 5 biryani plates.";
    }

    return null;
  }

  // ====================================================
  // ORDER NUMBER
  // ====================================================

  function generateOrderNumber() {
    return String(
      Math.floor(
        1000 + Math.random() * 9000
      )
    );
  }

  // ====================================================
  // WHATSAPP MESSAGE
  // ====================================================

  function createWhatsAppMessage(
    orderNumber: string
  ) {
    let message = "";

    message +=
      `*ANNAI FOODS - NEW ORDER*%0A`;

    message += `%0A`;

    message +=
      `*Order Number:* ${orderNumber}%0A`;

    message += `%0A`;

    message +=
      `*Customer Details*%0A`;

    message +=
      `Name: ${customerName.trim()}%0A`;

    message +=
      `Phone: ${customerPhone}%0A`;

    message += `%0A`;

    message +=
      `*Collection Details*%0A`;

    message +=
      `Collection Date: ${formatDisplayDate(
        collectionDate
      )}%0A`;

    message +=
      `Collection Method: ${collectionMethod}%0A`;

    message +=
      `Address: ${COLLECTION_ADDRESS}%0A`;

    message += `%0A`;

    message +=
      `*Order Items*%0A`;

    cartItems.forEach((item) => {
      const itemTotal =
        item.price * item.quantity;

      message +=
        `${item.name} x ${item.quantity} - R${itemTotal}%0A`;
    });

    message += `%0A`;

    message +=
      `*Order Summary*%0A`;

    message +=
      `Total Selected
