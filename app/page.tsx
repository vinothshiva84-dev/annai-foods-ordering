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

  const [year, month, day] =
    dateString.split("-");

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
    useState(
      getMinimumCollectionDate()
    );

  const [collectionMethod, setCollectionMethod] =
    useState<
      "Home collection" | "Uber pickup"
    >("Home collection");

  const [loading, setLoading] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  // ====================================================
  // CART
  // ====================================================

  const cartItems: CartItem[] =
    useMemo(() => {
      return MENU
        .filter(
          (item) =>
            (quantities[item.name] || 0) > 0
        )
        .map((item) => ({
          ...item,
          quantity:
            quantities[item.name],
        }));
    }, [quantities]);

  // ====================================================
  // TOTALS
  // ====================================================

  const totalAmount =
    useMemo(() => {
      return cartItems.reduce(
        (total, item) =>
          total +
          item.price *
            item.quantity,
        0
      );
    }, [cartItems]);

  const totalSelectedItems =
    useMemo(() => {
      return cartItems.reduce(
        (total, item) =>
          total + item.quantity,
        0
      );
    }, [cartItems]);

  const totalIdiyappamPlates =
    useMemo(() => {
      return cartItems.reduce(
        (total, item) => {
          if (
            item.type === "idiyappam"
          ) {
            return (
              total +
              item.quantity
            );
          }

          if (
            item.type === "combo"
          ) {
            return (
              total +
              item.quantity * 2
            );
          }

          return total;
        },
        0
      );
    }, [cartItems]);

  const totalPartyBiryaniPlates =
    useMemo(() => {
      return cartItems.reduce(
        (total, item) => {
          if (
            item.type === "party"
          ) {
            return (
              total +
              item.quantity
            );
          }

          return total;
        },
        0
      );
    }, [cartItems]);

  const hasRegularItems =
    cartItems.some(
      (item) =>
        item.type !== "party"
    );

  const hasPartyItems =
    cartItems.some(
      (item) =>
        item.type === "party"
    );

  // ====================================================
  // QUANTITY
  // ====================================================

  function increaseQuantity(
    itemName: string
  ) {
    setQuantities(
      (previous) => ({
        ...previous,
        [itemName]:
          (previous[itemName] ||
            0) + 1,
      })
    );
  }

  function decreaseQuantity(
    itemName: string
  ) {
    setQuantities(
      (previous) => {
        const current =
          previous[itemName] ||
          0;

        if (current <= 1) {
          const updated = {
            ...previous,
          };

          delete updated[
            itemName
          ];

          return updated;
        }

        return {
          ...previous,
          [itemName]:
            current - 1,
        };
      }
    );
  }

  // ====================================================
  // PHONE
  // ====================================================

  function handlePhoneChange(
    value: string
  ) {
    const digitsOnly =
      value
        .replace(/\D/g, "")
        .slice(0, 10);

    setCustomerPhone(
      digitsOnly
    );
  }

  // ====================================================
  // VALIDATION
  // ====================================================

  function validateOrder() {
    if (
      !customerName.trim()
    ) {
      return "Please enter your name.";
    }

    if (
      !/^\d{10}$/.test(
        customerPhone
      )
    ) {
      return "Please enter a valid 10-digit South African phone number.";
    }

    if (
      !collectionDate
    ) {
      return "Please select a collection date.";
    }

    const minimumDate =
      getMinimumCollectionDate();

    if (
      collectionDate <
      minimumDate
    ) {
      return "The selected collection date is no longer available. Please select another date.";
    }

    if (
      cartItems.length ===
      0
    ) {
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
        1000 +
          Math.random() *
            9000
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

    cartItems.forEach(
      (item) => {
        const itemTotal =
          item.price *
          item.quantity;

        message +=
          `${item.name} x ${item.quantity} - R${itemTotal}%0A`;
      }
    );

    message += `%0A`;

    message +=
      `*Order Summary*%0A`;

    message +=
      `Total Selected Items: ${totalSelectedItems}%0A`;

    message +=
      `Total Idiyappam Plates: ${totalIdiyappamPlates}%0A`;

    if (
      totalPartyBiryaniPlates >
      0
    ) {
      message +=
        `Total Party Biryani Plates: ${totalPartyBiryaniPlates}%0A`;
    }

    message +=
      `*GRAND TOTAL: R${totalAmount}*%0A`;

    message += `%0A`;

    message +=
      `Thank you for choosing ANNAI FOODS! ❤️`;

    return message;
  }

  // ====================================================
  // SUBMIT
  // ====================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const validationError =
      validateOrder();

    if (
      validationError
    ) {
      setErrorMessage(
        validationError
      );
      return;
    }

    setLoading(true);

    try {
      let orderNumber =
        generateOrderNumber();

      for (
        let attempt = 0;
        attempt < 10;
        attempt++
      ) {
        const {
          data:
            existingOrder,
        } =
          await supabase
            .from("orders")
            .select("id")
            .eq(
              "order_number",
              orderNumber
            )
            .maybeSingle();

        if (
          !existingOrder
        ) {
          break;
        }

        orderNumber =
          generateOrderNumber();
      }

      const orderItems =
        cartItems.map(
          (item) => ({
            name:
              item.name,
            price:
              item.price,
            quantity:
              item.quantity,
            total:
              item.price *
              item.quantity,
            type:
              item.type ||
              "other",
          })
        );

      const {
        error:
          insertError,
      } =
        await supabase
          .from("orders")
          .insert({
            order_number:
              orderNumber,
            customer_name:
              customerName.trim(),
            customer_phone:
              customerPhone,
            items:
              orderItems,
            total:
              totalAmount,
            idiyappam_plates:
              totalIdiyappamPlates,
            collection_date:
              collectionDate,
            collection_method:
              collectionMethod,
          });

      if (
        insertError
      ) {
        console.error(
          insertError
        );

        throw new Error(
          "Your order could not be saved. Please try again."
        );
      }

      const whatsappMessage =
        createWhatsAppMessage(
          orderNumber
        );

      const whatsappUrls =
        WHATSAPP_NUMBERS.map(
          (number) =>
            `https://wa.me/${number}?text=${whatsappMessage}`
        );

      setSuccessMessage(
        `Order #${orderNumber} has been submitted successfully.`
      );

      window.open(
        whatsappUrls[0],
        "_blank",
        "noopener,noreferrer"
      );

      setTimeout(() => {
        window.open(
          whatsappUrls[1],
          "_blank",
          "noopener,noreferrer"
        );
      }, 800);

      setCustomerName("");
      setCustomerPhone("");
      setQuantities({});

      setCollectionMethod(
        "Home collection"
      );

      setCollectionDate(
        getMinimumCollectionDate()
      );

    } catch (error) {
      console.error(
        error
      );

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
  // MENU SECTION
  // ====================================================

  function renderMenuSection(
    title: string,
    items: MenuItem[],
    note?: string
  ) {
    return (
      <section className="mb-7 rounded-[22px] bg-white px-7 py-7 shadow-[0_4px_18px_rgba(0,0,0,0.08)]">

        <h2 className="mb-5 text-[27px] font-extrabold uppercase tracking-wide text-[#91420f]">
          {title}
        </h2>

        {note && (
          <p className="mb-5 text-[18px] leading-7 text-gray-600">
            {note}
          </p>
        )}

        <div>
          {items.map(
            (item, index) => {
              const quantity =
                quantities[
                  item.name
                ] || 0;

              return (
                <div
                  key={
                    item.name
                  }
                  className={`flex items-center justify-between gap-4 py-5 ${
                    index <
                    items.length -
                      1
                      ? "border-b border-gray-200"
                      : ""
                  }`}
                >

                  <div className="min-w-0 flex-1 pr-2">

                    <h3 className="text-[20px] font-bold leading-7 text-gray-900">
                      {item.name}
                    </h3>

                    {item.description && (
                      <p className="mt-1 text-[17px] leading-6 text-gray-500">
                        {item.description}
                      </p>
                    )}

                    <p className="mt-2 text-[20px] font-extrabold text-[#91420f]">
                      R{item.price}
                    </p>

                  </div>

                  <div className="flex shrink-0 items-center gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(
                          item.name
                        )
                      }
                      disabled={
                        quantity ===
                        0
                      }
                      className="flex h-[56px] w-[56px] items-center justify-center rounded-[13px] bg-[#91420f] text-[28px] font-bold text-white disabled:opacity-50"
                    >
                      −
                    </button>

                    <span className="w-[28px] text-center text-[20px] font-semibold text-gray-800">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity(
                          item.name
                        )
                      }
                      className="flex h-[56px] w-[56px] items-center justify-center rounded-[13px] bg-[#91420f] text-[28px] font-bold text-white"
                    >
                      +
                    </button>

                  </div>

                </div>
              );
            }
          )}
        </div>

      </section>
    );
  }

  // ====================================================
  // MENU GROUPS
  // ====================================================

  const regularIdiyappam =
    MENU.filter(
      (item) =>
        item.type ===
        "idiyappam"
    );

  const kothuItems =
    MENU.filter(
      (item) =>
        item.name.includes(
          "Kothu"
        )
    );

  const gravyItems =
    MENU.filter(
      (item) =>
        [
          "Lamb Kurma / Gravy",
          "Chicken Kurma / Gravy",
          "Egg Kurma",
          "Veg White Kurma",
          "Attukal Paya",
        ].includes(
          item.name
        )
    );

  const comboItems =
    MENU.filter(
      (item) =>
        item.type ===
        "combo"
    );

  const sideItems =
    MENU.filter(
      (item) =>
        item.name ===
        "Coconut Milk"
    );

  const partyItems =
    MENU.filter(
      (item) =>
        item.type ===
        "party"
    );

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main className="min-h-screen bg-[#fffaf3] px-4 py-5">

      <div className="mx-auto w-full max-w-[700px]">

        {/* HEADER */}

        <div className="mb-6 rounded-[22px] bg-white px-7 py-7 shadow-[0_4px_18px_rgba(0,0,0,0.08)]">

          <h1 className="text-[32px] font-extrabold tracking-wide text-[#91420f]">
            ANNAI FOODS
          </h1>

          <p className="mt-2 text-[19px] font-semibold text-gray-800">
            Fresh Homemade Idiyappam ❤️
          </p>

          <p className="mt-1 text-[17px] text-gray-600">
            Soft • Fresh • Healthy • Delicious
          </p>

          <p className="mt-3 text-[16px] text-gray-600">
            Fresh Homemade Idiyappam – Made with Love ❤️
          </p>

        </div>

        <form
          onSubmit={
            handleSubmit
          }
        >

          {/* REGULAR MENU */}

          {renderMenuSection(
            "IDYAPPAM",
            regularIdiyappam
          )}

          {/* KOTHU */}

          {renderMenuSection(
            "KOTHU",
            kothuItems
          )}

          {/* GRAVY & KURMA */}

          {renderMenuSection(
            "GRAVY & KURMA",
            gravyItems
          )}

          {/* COMBOS */}

          {renderMenuSection(
            "COMBOS",
            comboItems
          )}

          {/* SIDES */}

          {renderMenuSection(
            "SIDES",
            sideItems
          )}

          {/* PARTY MENU */}

          {renderMenuSection(
            "PARTY MENU – CHENNAI STYLE DUM BIRYANI",
            partyItems,
            "Minimum 5 plates. You can mix Lamb and Chicken Biryani."
          )}

          {/* ORDER SUMMARY */}

          <section className="mb-7 rounded-[22px] bg-white px-7 py-7 shadow-[0_4px_18px_rgba(0,0,0,0.08)]">

            <h2 className="mb-5 text-[27px] font-extrabold uppercase tracking-wide text-[#91420f]">
              ORDER SUMMARY
            </h2>

            {cartItems.length ===
            0 ? (

              <p className="text-[17px] text-gray-500">
                No items selected.
              </p>

            ) : (

              <div>

                {cartItems.map(
                  (item) => (
                    <div
                      key={
                        item.name
                      }
                      className="flex justify-between gap-4 border-b border-gray-200 py-3"
                    >

                      <div>

                        <p className="font-bold text-gray-900">
                          {item.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {item.quantity} × R{item.price}
                        </p>

                      </div>

                      <p className="font-bold text-gray-900">
                        R
                        {item.quantity *
                          item.price}
                      </p>

                    </div>
                  )
                )}

                <div className="mt-5 space-y-2 text-[17px]">

                  <div className="flex justify-between">
                    <span>
                      Total Selected Items
                    </span>

                    <strong>
                      {totalSelectedItems}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span>
                      Total Idiyappam Plates
                    </span>

                    <strong>
                      {totalIdiyappamPlates}
                    </strong>
                  </div>

                  {totalPartyBiryaniPlates >
                    0 && (
                    <div className="flex justify-between">

                      <span>
                        Party Biryani Plates
                      </span>

                      <strong>
                        {totalPartyBiryaniPlates}
                      </strong>

                    </div>
                  )}

                  <div className="mt-4 flex justify-between border-t-2 border-gray-200 pt-4 text-[22px]">

                    <strong>
                      GRAND TOTAL
                    </strong>

                    <strong className="text-[#91420f]">
                      R{totalAmount}
                    </strong>

                  </div>

                </div>

              </div>

            )}

          </section>

          {/* COLLECTION DETAILS */}

          <section className="mb-7 rounded-[22px] bg-white px-7 py-7 shadow-[0_4px_18px_rgba(0,0,0,0.08)]">

            <h2 className="mb-5 text-[27px] font-extrabold text-[#91420f]">
              COLLECTION DETAILS
            </h2>

            <div className="space-y-6">

              {/* COLLECTION DATE */}

              <div>

                <label className="mb-2 block text-[19px] font-bold text-gray-900">
                  Collection Date
                </label>

                <input
                  type="date"
                  min={
                    getMinimumCollectionDate()
                  }
                  value={
                    collectionDate
                  }
                  onChange={(
                    event
                  ) =>
                    setCollectionDate(
                      event
                        .target
                        .value
                    )
                  }
                  className="w-full rounded-[14px] border-2 border-gray-300 bg-white px-5 py-4 text-[18px] outline-none focus:border-[#91420f]"
                />

                <p className="mt-2 text-[15px] text-gray-500">
                  Same-day collection is available before 12:00 PM Johannesburg time.
                </p>

              </div>

              {/* COLLECTION METHOD */}

              <div>

                <h3 className="mb-4 text-[20px] font-bold text-gray-900">
                  Collection Method
                </h3>

                <div className="space-y-5">

                  <label className="flex cursor-pointer items-start gap-4">

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
                      className="mt-1 h-7 w-7 accent-[#91420f]"
                    />

                    <div>

                      <p className="text-[20px] font-bold text-gray-900">
                        Home collection
                      </p>

                      <p className="mt-1 text-[16px] leading-6 text-gray-600">
                        {COLLECTION_ADDRESS}
                      </p>

                    </div>

                  </label>

                  <label className="flex cursor-pointer items-start gap-4">

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
                      className="mt-1 h-7 w-7 accent-[#91420f]"
                    />

                    <div>

                      <p className="text-[20px] font-bold text-gray-900">
                        Uber pickup
                      </p>

                      <p className="mt-2 text-[16px] leading-6 text-gray-600">
                        For Uber pickup, the customer must arrange the Uber driver to collect from the address above. Uber charges are the customer's responsibility.
                      </p>

                    </div>

                  </label>

                </div>

              </div>

            </div>

          </section>

          {/* CUSTOMER DETAILS */}

          <section className="mb-7 rounded-[22px] bg-white px-7 py-7 shadow-[0_4px_18px_rgba(0,0,0,0.08)]">

            <h2 className="mb-6 text-[29px] font-extrabold tracking-wide text-[#91420f]">
              CUSTOMER DETAILS
            </h2>

            <div className="space-y-6">

              {/* NAME */}

              <div>

                <label className="mb-2 block text-[19px] font-bold text-gray-900">
                  Full Name
                </label>

                <input
                  type="text"
                  value={
                    customerName
                  }
                  onChange={(
                    event
                  ) =>
                    setCustomerName(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Enter your full name"
                  className="w-full rounded-[14px] border-2 border-gray-300 bg-white px-5 py-4 text-[20px] outline-none focus:border-[#91420f]"
                />

              </div>

              {/* PHONE */}

              <div>

                <label className="mb-2 block text-[19px] font-bold text-gray-900">
                  WhatsApp / Contact Number
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={
                    customerPhone
                  }
                  onChange={(
                    event
                  ) =>
                    handlePhoneChange(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="10-digit number"
                  className="w-full rounded-[14px] border-2 border-gray-300 bg-white px-5 py-4 text-[20px] outline-none focus:border-[#91420f]"
                />

              </div>

            </div>

          </section>

          {/* MINIMUM ORDER WARNING */}

          {errorMessage && (
            <div className="mb-5 rounded-[16px] bg-[#fde9e9] px-5 py-5 text-[18px] leading-7 text-[#9b2929]">
              {errorMessage}
            </div>
          )}

          {!errorMessage && (
            <div className="mb-5 rounded-[16px] bg-[#fde9e9] px-5 py-5 text-[18px] leading-7 text-[#9b2929]">
              The minimum regular order is 5 plates of Idiyappam. Combos count as 2 plates each.
            </div>
          )}

          {/* SUCCESS */}

          {successMessage && (
            <div className="mb-5 rounded-[16px] bg-green-100 px-5 py-5 text-[17px] font-semibold text-green-800">
              {successMessage}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={
              loading
            }
            className="mb-8 w-full rounded-[15px] bg-[#91420f] px-6 py-5 text-[22px] font-extrabold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Submitting Order..."
              : "Submit Order"}
          </button>

        </form>

      </div>

    </main>
  );
}
