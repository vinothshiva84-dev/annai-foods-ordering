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
  // -------------------------------
  // REGULAR IDIYAPPAM
  // -------------------------------
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

  // -------------------------------
  // KOTHU
  // -------------------------------
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

  // -------------------------------
  // GRAVY & KURMA
  // -------------------------------
  {
    name: "Lamb Kurma / Gravy",
    price: 140,
    description: "Rich homemade lamb kurma / gravy",
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

  // -------------------------------
  // COMBOS
  // -------------------------------
  {
    name: "Combo 1",
    price: 140,
    type: "combo",
    description: "2 plates Idiyappam + Chicken Gravy",
  },
  {
    name: "Combo 2",
    price: 125,
    type: "combo",
    description: "2 plates Idiyappam + Veg White Kurma",
  },

  // -------------------------------
  // SIDES
  // -------------------------------
  {
    name: "Coconut Milk",
    price: 50,
    description: "Fresh coconut milk",
  },

  // -------------------------------
  // PARTY MENU
  // -------------------------------
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
// JOHANNESBURG DATE HELPERS
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

  const today = new Date(now.year, now.month - 1, now.day);

  // Before 12:00 PM Johannesburg time:
  // today is allowed.
  //
  // At/after 12:00 PM:
  // today is closed and tomorrow is the earliest date.
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
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [collectionDate, setCollectionDate] = useState(
    getMinimumCollectionDate()
  );
  const [collectionMethod, setCollectionMethod] = useState<
    "Home collection" | "Uber pickup"
  >("Home collection");

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ====================================================
  // CART
  // ====================================================

  const cartItems: CartItem[] = useMemo(() => {
    return MENU.filter((item) => (quantities[item.name] || 0) > 0).map(
      (item) => ({
        ...item,
        quantity: quantities[item.name],
      })
    );
  }, [quantities]);

  // ====================================================
  // TOTALS
  // ====================================================

  const totalAmount = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const totalSelectedItems = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const totalIdiyappamPlates = useMemo(() => {
    return cartItems.reduce((total, item) => {
      if (item.type === "idiyappam") {
        return total + item.quantity;
      }

      if (item.type === "combo") {
        return total + item.quantity * 2;
      }

      return total;
    }, 0);
  }, [cartItems]);

  const totalPartyBiryaniPlates = useMemo(() => {
    return cartItems.reduce((total, item) => {
      if (item.type === "party") {
        return total + item.quantity;
      }

      return total;
    }, 0);
  }, [cartItems]);

  const hasRegularItems = useMemo(() => {
    return cartItems.some(
      (item) => item.type !== "party"
    );
  }, [cartItems]);

  const hasPartyItems = useMemo(() => {
    return cartItems.some(
      (item) => item.type === "party"
    );
  }, [cartItems]);

  // ====================================================
  // QUANTITY HANDLERS
  // ====================================================

  function increaseQuantity(itemName: string) {
    setQuantities((previous) => ({
      ...previous,
      [itemName]: (previous[itemName] || 0) + 1,
    }));
  }

  function decreaseQuantity(itemName: string) {
    setQuantities((previous) => {
      const current = previous[itemName] || 0;

      if (current <= 1) {
        const updated = { ...previous };
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
  // PHONE HANDLER
  // ====================================================

  function handlePhoneChange(value: string) {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);

    setCustomerPhone(digitsOnly);
  }

  // ====================================================
  // ORDER VALIDATION
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

    const minimumDate = getMinimumCollectionDate();

    if (collectionDate < minimumDate) {
      return "The selected collection date is no longer available. Please select another date.";
    }

    if (cartItems.length === 0) {
      return "Please select at least one menu item.";
    }

    // Regular menu minimum
    if (hasRegularItems && totalIdiyappamPlates < 5) {
      return `Minimum order is 5 Idiyappam plates. You currently have ${totalIdiyappamPlates}.`;
    }

    // Party menu minimum
    if (hasPartyItems && totalPartyBiryaniPlates < 5) {
      return `Minimum party order is 5 biryani plates. You currently have ${totalPartyBiryaniPlates}.`;
    }

    return null;
  }

  // ====================================================
  // ORDER NUMBER
  // ====================================================

  function generateOrderNumber() {
    return String(
      Math.floor(1000 + Math.random() * 9000)
    );
  }

  // ====================================================
  // WHATSAPP MESSAGE
  // ====================================================

  function createWhatsAppMessage(orderNumber: string) {
    let message = "";

    message += `*ANNAI FOODS - NEW ORDER*%0A`;
    message += `%0A`;
    message += `*Order Number:* ${orderNumber}%0A`;
    message += `%0A`;

    message += `*Customer Details*%0A`;
    message += `Name: ${customerName.trim()}%0A`;
    message += `Phone: ${customerPhone}%0A`;
    message += `%0A`;

    message += `*Collection Details*%0A`;
    message += `Collection Date: ${formatDisplayDate(
      collectionDate
    )}%0A`;
    message += `Collection Method: ${collectionMethod}%0A`;

    if (collectionMethod === "Home collection") {
      message += `Address: ${COLLECTION_ADDRESS}%0A`;
    }

    message += `%0A`;

    message += `*Order Items*%0A`;

    cartItems.forEach((item) => {
      const itemTotal = item.price * item.quantity;

      message += `${item.name} x ${item.quantity} - R${itemTotal}%0A`;
    });

    message += `%0A`;

    message += `*Order Summary*%0A`;
    message += `Total Selected Items: ${totalSelectedItems}%0A`;
    message += `Total Idiyappam Plates: ${totalIdiyappamPlates}%0A`;

    if (totalPartyBiryaniPlates > 0) {
      message += `Total Party Biryani Plates: ${totalPartyBiryaniPlates}%0A`;
    }

    message += `*GRAND TOTAL: R${totalAmount}*%0A`;

    message += `%0A`;
    message += `Thank you for choosing ANNAI FOODS! ❤️`;

    return message;
  }

  // ====================================================
  // SUBMIT ORDER
  // ====================================================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateOrder();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);

    try {
      let orderNumber = generateOrderNumber();

      // Make sure the order number is unique.
      // Retry a few times if necessary.
      for (let attempt = 0; attempt < 10; attempt++) {
        const { data: existingOrder } = await supabase
          .from("orders")
          .select("id")
          .eq("order_number", orderNumber)
          .maybeSingle();

        if (!existingOrder) {
          break;
        }

        orderNumber = generateOrderNumber();
      }

      const orderItems = cartItems.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
        type: item.type || "other",
      }));

      const { error: insertError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: customerName.trim(),
          customer_phone: customerPhone,
          items: orderItems,
          total: totalAmount,
          idiyappam_plates: totalIdiyappamPlates,
          collection_date: collectionDate,
          collection_method: collectionMethod,
        });

      if (insertError) {
        console.error("Supabase order error:", insertError);

        throw new Error(
          "Your order could not be saved. Please try again."
        );
      }

      const whatsappMessage =
        createWhatsAppMessage(orderNumber);

      setSuccessMessage(
        `Order #${orderNumber} has been submitted successfully.`
      );

      // Open WhatsApp notifications for BOTH Annai Foods numbers.
      const whatsappUrls = WHATSAPP_NUMBERS.map(
        (number) =>
          `https://wa.me/${number}?text=${whatsappMessage}`
      );

      // Open the first WhatsApp notification.
      window.open(
        whatsappUrls[0],
        "_blank",
        "noopener,noreferrer"
      );

      // Open the second WhatsApp notification after a short delay.
      setTimeout(() => {
        window.open(
          whatsappUrls[1],
          "_blank",
          "noopener,noreferrer"
        );
      }, 800);

      // Clear the form after successful submission.
      setCustomerName("");
      setCustomerPhone("");
      setQuantities({});
      setCollectionMethod("Home collection");
      setCollectionDate(getMinimumCollectionDate());

    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting your order."
      );

    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main className="min-h-screen bg-orange-50 px-4 py-6">

      <div className="mx-auto max-w-3xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 rounded-2xl bg-white p-6 text-center shadow-md">

          <h1 className="text-3xl font-extrabold tracking-wide text-orange-700">
            ANNAI FOODS
          </h1>

          <p className="mt-2 text-lg font-semibold text-gray-800">
            Fresh Homemade Idiyappam ❤️
          </p>

          <p className="mt-1 text-sm text-gray-600">
            Soft • Fresh • Healthy • Delicious
          </p>

          <p className="mt-3 text-sm text-gray-600">
            Fresh Homemade Idiyappam – Made with Love ❤️
          </p>

        </div>

        {/* =================================================
            ORDER FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* =================================================
              CUSTOMER DETAILS
          ================================================= */}

          <section className="rounded-2xl bg-white p-5 shadow-md">

            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Customer Details
            </h2>

            <div className="space-y-4">

              <div>

                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Name
                </label>

                <input
                  type="text"
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(event.target.value)
                  }
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                />

              </div>

              <div>

                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Phone Number
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  value={customerPhone}
                  onChange={(event) =>
                    handlePhoneChange(event.target.value)
                  }
                  placeholder="10-digit phone number"
                  maxLength={10}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Enter exactly 10 digits. Do not include +27.
                </p>

              </div>

            </div>

          </section>

          {/* =================================================
              MENU
          ================================================= */}

          <section className="rounded-2xl bg-white p-5 shadow-md">

            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Menu
            </h2>

            <div className="space-y-3">

              {MENU.map((item) => {

                const quantity =
                  quantities[item.name] || 0;

                return (
                  <div
                    key={item.name}
                    className="rounded-xl border border-gray-200 p-4"
                  >

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex-1">

                        <h3 className="font-bold text-gray-900">
                          {item.name}
                        </h3>

                        {item.description && (
                          <p className="mt-1 text-sm text-gray-500">
                            {item.description}
                          </p>
                        )}

                        <p className="mt-2 font-semibold text-orange-700">
                          R{item.price}
                        </p>

                      </div>

                      <div className="flex items-center gap-3">

                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(item.name)
                          }
                          disabled={quantity === 0}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          −
                        </button>

                        <span className="min-w-[28px] text-center text-lg font-bold">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(item.name)
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-xl font-bold text-white"
                        >
                          +
                        </button>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

          </section>

          {/* =================================================
              CART SUMMARY
          ================================================= */}

          <section className="rounded-2xl bg-white p-5 shadow-md">

            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            {cartItems.length === 0 ? (

              <p className="text-sm text-gray-500">
                No items selected yet.
              </p>

            ) : (

              <div className="space-y-3">

                {cartItems.map((item) => (

                  <div
                    key={item.name}
                    className="flex justify-between gap-4 border-b border-gray-100 pb-2"
                  >

                    <div>

                      <p className="font-semibold text-gray-800">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {item.quantity} × R{item.price}
                      </p>

                    </div>

                    <p className="font-bold text-gray-900">
                      R{item.quantity * item.price}
                    </p>

                  </div>

                ))}

                <div className="space-y-2 pt-3 text-sm">

                  <div className="flex justify-between">

                    <span>
                      Total Selected Items
                    </span>

                    <span className="font-semibold">
                      {totalSelectedItems}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span>
                      Total Idiyappam Plates
                    </span>

                    <span className="font-semibold">
                      {totalIdiyappamPlates}
                    </span>

                  </div>

                  {totalPartyBiryaniPlates > 0 && (

                    <div className="flex justify-between">

                      <span>
                        Party Biryani Plates
                      </span>

                      <span className="font-semibold">
                        {totalPartyBiryaniPlates}
                      </span>

                    </div>

                  )}

                </div>

                <div className="mt-4 flex justify-between border-t-2 border-orange-200 pt-4 text-xl">

                  <span className="font-extrabold">
                    GRAND TOTAL
                  </span>

                  <span className="font-extrabold text-orange-700">
                    R{totalAmount}
                  </span>

                </div>

              </div>

            )}

          </section>

          {/* =================================================
              COLLECTION DETAILS
          ================================================= */}

          <section className="rounded-2xl bg-white p-5 shadow-md">

            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Collection Details
            </h2>

            <div className="space-y-5">

              <div>

                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Collection Date
                </label>

                <input
                  type="date"
                  min={getMinimumCollectionDate()}
                  value={collectionDate}
                  onChange={(event) =>
                    setCollectionDate(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Same-day collection is available only before
                  12:00 PM Johannesburg time.
                </p>

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Collection Method
                </label>

                <div className="space-y-3">

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3">

                    <input
                      type="radio"
                      name="collectionMethod"
                      value="Home collection"
                      checked={
                        collectionMethod ===
                        "Home collection"
                      }
                      onChange={() =>
                        setCollectionMethod(
                          "Home collection"
                        )
                      }
                    />

                    <span>

                      <span className="block font-semibold">
                        Home collection
                      </span>

                      <span className="text-xs text-gray-500">
                        {COLLECTION_ADDRESS}
                      </span>

                    </span>

                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3">

                    <input
                      type="radio"
                      name="collectionMethod"
                      value="Uber pickup"
                      checked={
                        collectionMethod ===
                        "Uber pickup"
                      }
                      onChange={() =>
                        setCollectionMethod(
                          "Uber pickup"
                        )
                      }
                    />

                    <span>

                      <span className="block font-semibold">
                        Uber pickup
                      </span>

                      <span className="text-xs text-gray-500">
                        Customer arranges Uber pickup.
                      </span>

                    </span>

                  </label>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              MINIMUM ORDER NOTICE
          ================================================= */}

          <section className="rounded-2xl border border-orange-200 bg-orange-100 p-4">

            <p className="text-sm font-semibold text-orange-900">
              Order requirements
            </p>

            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-orange-900">

              <li>
                Regular menu orders require a minimum of
                5 Idiyappam plates.
              </li>

              <li>
                Each combo counts as 2 Idiyappam plates.
              </li>

              <li>
                Party biryani orders require a minimum of
                5 biryani plates.
              </li>

            </ul>

          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {errorMessage && (

            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>

          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {successMessage && (

            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">

              {successMessage}

              <p className="mt-2 font-normal">
                WhatsApp has been opened for Annai Foods
                order notification.
              </p>

            </div>

          )}

          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-orange-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading
              ? "SUBMITTING ORDER..."
              : "SUBMIT ORDER"}

          </button>

        </form>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="mt-8 pb-8 text-center text-sm text-gray-500">

          <p className="font-semibold">
            ANNAI FOODS ❤️
          </p>

          <p className="mt-1">
            Fresh Homemade Idiyappam – Made with Love
          </p>

        </div>

      </div>

    </main>
  );
}
