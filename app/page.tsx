"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { createClient } from "@supabase/supabase-js";

// ======================================================
// SUPABASE
// ======================================================

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);

// ======================================================
// TYPES
// ======================================================

type MenuType =
  | "idiyappam"
  | "combo"
  | "party"
  | "other";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  type?: MenuType;
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
    id: "rice-idiyappam",
    name: "Rice Idiyappam",
    price: 30,
    type: "idiyappam",
    description:
      "Fresh homemade rice idiyappam",
  },

  {
    id: "ragi-idiyappam",
    name: "Ragi Idiyappam",
    price: 35,
    type: "idiyappam",
    description:
      "Healthy homemade ragi idiyappam",
  },

  {
    id: "wheat-idiyappam",
    name: "Wheat Idiyappam",
    price: 35,
    type: "idiyappam",
    description:
      "Fresh homemade wheat idiyappam",
  },

  {
    id: "sweet-rice-idiyappam",
    name: "Sweet Rice Idiyappam",
    price: 45,
    type: "idiyappam",
    description:
      "Sweet rice idiyappam",
  },

  {
    id: "sweet-ragi-idiyappam",
    name: "Sweet Ragi Idiyappam",
    price: 45,
    type: "idiyappam",
    description:
      "Sweet ragi idiyappam",
  },

  // KOTHU

  {
    id: "egg-idiyappam-kothu",
    name: "Egg Idiyappam Kothu",
    price: 80,
    type: "other",
    description:
      "Egg idiyappam kothu",
  },

  {
    id: "chicken-idiyappam-kothu",
    name: "Chicken Idiyappam Kothu",
    price: 100,
    type: "other",
    description:
      "Chicken idiyappam kothu",
  },

  // GRAVY & KURMA

  {
    id: "lamb-kurma",
    name: "Lamb Kurma / Gravy",
    price: 140,
    type: "other",
    description:
      "Rich homemade lamb kurma / gravy",
  },

  {
    id: "chicken-kurma",
    name: "Chicken Kurma / Gravy",
    price: 100,
    type: "other",
    description:
      "Homemade chicken kurma / gravy",
  },

  {
    id: "egg-kurma",
    name: "Egg Kurma",
    price: 90,
    type: "other",
    description:
      "Homemade egg kurma",
  },

  {
    id: "veg-white-kurma",
    name: "Veg White Kurma",
    price: 80,
    type: "other",
    description:
      "Creamy vegetarian white kurma",
  },

  {
    id: "attukal-paya",
    name: "Attukal Paya",
    price: 125,
    type: "other",
    description:
      "Traditional homemade attukal paya",
  },

  // COMBOS

  {
    id: "combo-1",
    name: "Combo 1",
    price: 140,
    type: "combo",
    description:
      "2 plates Idiyappam + 1 portion Chicken Gravy",
  },

  {
    id: "combo-2",
    name: "Combo 2",
    price: 125,
    type: "combo",
    description:
      "2 plates Idiyappam + Veg White Kurma + Coconut Milk",
  },

  // SIDES

  {
    id: "coconut-milk",
    name: "Coconut Milk",
    price: 50,
    type: "other",
    description:
      "Fresh coconut milk",
  },

  // PARTY MENU

  {
    id: "lamb-biryani",
    name:
      "Chennai Style Lamb Dum Biryani with Egg",
    price: 140,
    type: "party",
    description:
      "Chennai-style lamb dum biryani with egg",
  },

  {
    id: "chicken-biryani",
    name:
      "Chennai Style Chicken Dum Biryani with Egg",
    price: 110,
    type: "party",
    description:
      "Chennai-style chicken dum biryani with egg",
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
  const parts =
    new Intl.DateTimeFormat("en-CA", {
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
    parts.find(
      (part) => part.type === type
    )?.value || "";

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
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMinimumCollectionDate() {
  const now =
    getJohannesburgDateParts();

  const today = new Date(
    now.year,
    now.month - 1,
    now.day
  );

  if (now.hour < 12) {
    return formatDateForInput(today);
  }

  today.setDate(
    today.getDate() + 1
  );

  return formatDateForInput(today);
}

function formatDisplayDate(
  dateString: string
) {
  if (!dateString) return "";

  const [
    year,
    month,
    day,
  ] = dateString.split("-");

  return `${day}/${month}/${year}`;
}

// ======================================================
// COMPONENT
// ======================================================

export default function Home() {
  const [
    quantities,
    setQuantities,
  ] = useState<
    Record<string, number>
  >({});

  const [
    customerName,
    setCustomerName,
  ] = useState("");

  const [
    customerPhone,
    setCustomerPhone,
  ] = useState("");

  const [
    collectionDate,
    setCollectionDate,
  ] = useState(
    getMinimumCollectionDate()
  );

  const [
    collectionMethod,
    setCollectionMethod,
  ] = useState<
    "Home collection" | "Uber pickup"
  >("Home collection");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  // ====================================================
  // CART
  // ====================================================

  const cartItems: CartItem[] =
    useMemo(() => {
      return MENU.filter(
        (item) =>
          (quantities[item.id] || 0) >
          0
      ).map((item) => ({
        ...item,
        quantity:
          quantities[item.id],
      }));
    }, [quantities]);

  // ====================================================
  // TOTAL
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

  // ====================================================
  // SELECTED ITEMS
  // ====================================================

  const totalSelectedItems =
    useMemo(() => {
      return cartItems.reduce(
        (total, item) =>
          total +
          item.quantity,
        0
      );
    }, [cartItems]);

  // ====================================================
  // IDIYAPPAM PLATES
  // ====================================================

  const totalIdiyappamPlates =
    useMemo(() => {
      return cartItems.reduce(
        (total, item) => {
          if (
            item.type ===
            "idiyappam"
          ) {
            return (
              total +
              item.quantity
            );
          }

          if (
            item.type ===
            "combo"
          ) {
            return (
              total +
              item.quantity *
                2
            );
          }

          return total;
        },
        0
      );
    }, [cartItems]);

  // ====================================================
  // BIRYANI PLATES
  // ====================================================

  const totalPartyBiryaniPlates =
    useMemo(() => {
      return cartItems.reduce(
        (total, item) => {
          if (
            item.type ===
            "party"
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
        item.type !==
        "party"
    );

  const hasPartyItems =
    cartItems.some(
      (item) =>
        item.type ===
        "party"
    );

  // ====================================================
  // QUANTITY
  // ====================================================

  function increaseQuantity(
    id: string
  ) {
    setQuantities(
      (previous) => ({
        ...previous,
        [id]:
          (previous[id] ||
            0) + 1,
      })
    );
  }

  function decreaseQuantity(
    id: string
  ) {
    setQuantities(
      (previous) => {
        const current =
          previous[id] ||
          0;

        if (
          current <= 1
        ) {
          const updated =
            {
              ...previous,
            };

          delete updated[id];

          return updated;
        }

        return {
          ...previous,
          [id]:
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
    const digits =
      value
        .replace(
          /\D/g,
          ""
        )
        .slice(
          0,
          10
        );

    setCustomerPhone(
      digits
    );
  }

  // ====================================================
  // VALIDATION
  // ====================================================

  function validateOrder() {
    if (
      !customerName.trim()
    ) {
      return "Please enter your full name.";
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

    if (
      collectionDate <
      getMinimumCollectionDate()
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
      totalIdiyappamPlates <
        5
    ) {
      return "The minimum regular order is 5 plates of Idiyappam. Combos count as 2 plates each.";
    }

    if (
      hasPartyItems &&
      totalPartyBiryaniPlates <
        5
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
    let message =
      "*ANNAI FOODS - NEW ORDER*%0A";

    message += "%0A";

    message +=
      `*Order Number:* ${orderNumber}%0A`;

    message += "%0A";

    message +=
      "*Customer Details*%0A";

    message +=
      `Name: ${customerName.trim()}%0A`;

    message +=
      `Phone: ${customerPhone}%0A`;

    message += "%0A";

    message +=
      "*Collection Details*%0A";

    message +=
      `Collection Date: ${formatDisplayDate(
        collectionDate
      )}%0A`;

    message +=
      `Collection Method: ${collectionMethod}%0A`;

    message +=
      `Address: ${COLLECTION_ADDRESS}%0A`;

    message += "%0A";

    message +=
      "*Order Items*%0A";

    cartItems.forEach(
      (item) => {
        message +=
          `${item.name} x ${item.quantity} - R${
            item.price *
            item.quantity
          }%0A`;
      }
    );

    message += "%0A";

    message +=
      "*Order Summary*%0A";

    message +=
      `Total Selected Items: ${totalSelectedItems}%0A`;

    message +=
      `Total Idiyappam Plates: ${totalIdiyappamPlates}%0A`;

    if (
      totalPartyBiryaniPlates >
      0
    ) {
      message +=
        `Party Biryani Plates: ${totalPartyBiryaniPlates}%0A`;
    }

    message +=
      `*GRAND TOTAL: R${totalAmount}*%0A`;

    message += "%0A";

    message +=
      "Thank you for choosing ANNAI FOODS! ❤️";

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

    if (validationError) {
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

      const message =
        createWhatsAppMessage(
          orderNumber
        );

      setSuccessMessage(
        `Order #${orderNumber} has been submitted successfully.`
      );

      const urls =
        WHATSAPP_NUMBERS.map(
          (number) =>
            `https://wa.me/${number}?text=${message}`
        );

      window.open(
        urls[0],
        "_blank"
      );

      setTimeout(() => {
        window.open(
          urls[1],
          "_blank"
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
  // MENU ITEM
  // ====================================================

  function MenuItemRow({
    item,
  }: {
    item: MenuItem;
  }) {
    const quantity =
      quantities[
        item.id
      ] || 0;

    return (
      <div className="menu-item">
        <div className="item-info">

          <div className="item-name">
            {item.name}
          </div>

          {item.description && (
            <div className="item-description">
              {item.description}
            </div>
          )}

          <div className="item-price">
            R{item.price}
          </div>

        </div>

        <div className="quantity">

          <button
            type="button"
            onClick={() =>
              decreaseQuantity(
                item.id
              )
            }
            disabled={
              quantity === 0
            }
            aria-label={`Decrease ${item.name}`}
          >
            −
          </button>

          <span>
            {quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              increaseQuantity(
                item.id
              )
            }
            aria-label={`Increase ${item.name}`}
          >
            +
          </button>

        </div>
      </div>
    );
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <>
      <style jsx global>{`

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #fbf3e8;
          color: #222;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        button,
        input,
        select,
        textarea {
          font: inherit;
        }

        .page {
          min-height: 100vh;
          background:
            #fbf3e8;
          padding:
            18px 14px 40px;
        }

        .container {
          width: 100%;
          max-width: 720px;
          margin:
            0 auto;
        }

        /* ==========================================
           HEADER
        ========================================== */

        .header {
          background: #fff;
          border-radius: 22px;
          padding:
            25px 20px;
          margin-bottom: 18px;
          text-align: center;
          border:
            1px solid #f0e2d3;
          box-shadow:
            0 3px 12px
              rgba(92, 48, 16, 0.06);
        }

        .brand {
          margin: 0;
          color: #963f0d;
          font-size:
            31px;
          line-height: 1.1;
          font-weight: 900;
          letter-spacing:
            1.5px;
        }

        .tagline {
          margin:
            10px 0 0;
          color: #222;
          font-size:
            18px;
          font-weight: 700;
        }

        .subtag {
          margin:
            5px 0 0;
          color: #777;
          font-size:
            14px;
        }

        .love {
          margin:
            13px 0 0;
          color: #777;
          font-size:
            13px;
        }

        /* ==========================================
           SECTION
        ========================================== */

        .section {
          background: #fff;
          border-radius: 22px;
          padding:
            24px 20px;
          margin-bottom: 18px;
          border:
            1px solid #f0e2d3;
          box-shadow:
            0 3px 12px
              rgba(92, 48, 16, 0.06);
        }

        .section-title {
          margin:
            0 0 20px;
          color: #963f0d;
          font-size:
            27px;
          line-height:
            1.2;
          font-weight:
            900;
          letter-spacing:
            0.2px;
        }

        /* ==========================================
           MENU ITEM
        ========================================== */

        .menu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding:
            19px 0;
          border-bottom:
            1px solid #eee4d9;
        }

        .menu-item:last-child {
          border-bottom: none;
          padding-bottom: 4px;
        }

        .item-info {
          flex:
            1 1 auto;
          min-width: 0;
        }

        .item-name {
          color: #111;
          font-size:
            18px;
          line-height:
            1.3;
          font-weight:
            800;
        }

        .item-description {
          margin-top:
            5px;
          color: #687080;
          font-size:
            16px;
          line-height:
            1.35;
        }

        .item-price {
          margin-top:
            7px;
          color: #963f0d;
          font-size:
            19px;
          font-weight:
            900;
        }

        /* ==========================================
           QUANTITY
        ========================================== */

        .quantity {
          display: flex;
          align-items: center;
          gap: 14px;
          flex:
            0 0 auto;
        }

        .quantity button {
          width: 55px;
          height: 55px;
          border: none;
          border-radius: 11px;
          background: #963f0d;
          color: white;
          font-size:
            31px;
          line-height:
            1;
          font-weight:
            700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-bottom:
            4px;
        }

        .quantity button:disabled {
          opacity: 0.35;
          cursor:
            not-allowed;
        }

        .quantity span {
          min-width:
            20px;
          text-align:
            center;
          color: #222;
          font-size:
            19px;
          font-weight:
            800;
        }

        /* ==========================================
           PARTY DESCRIPTION
        ========================================== */

        .party-description {
          margin:
            -6px 0 5px;
          color: #666;
          font-size:
            16px;
          line-height:
            1.45;
        }

        /* ==========================================
           SUMMARY
        ========================================== */

        .summary-row {
          display: flex;
          justify-content:
            space-between;
          gap: 15px;
          padding:
            9px 0;
          font-size:
            15px;
        }

        .summary-row strong {
          font-weight:
            800;
        }

        .grand-total {
          display: flex;
          justify-content:
            space-between;
          align-items:
            center;
          margin-top:
            14px;
          padding-top:
            17px;
          border-top:
            2px solid #963f0d;
          color: #222;
          font-size:
            20px;
          font-weight:
            900;
        }

        .grand-total-value {
          color: #963f0d;
          font-size:
            23px;
        }

        /* ==========================================
           COLLECTION
        ========================================== */

        .field {
          margin-bottom:
            22px;
        }

        .field:last-child {
          margin-bottom: 0;
        }

        .label {
          display: block;
          margin-bottom:
            9px;
          color: #222;
          font-size:
            17px;
          font-weight:
            800;
        }

        .input {
          width: 100%;
          height: 55px;
          padding:
            0 16px;
          border:
            2px solid #d8d3cd;
          border-radius:
            12px;
          background: #fff;
          color: #222;
          font-size:
            17px;
          outline: none;
        }

        .input:focus {
          border-color:
            #963f0d;
        }

        .date-note {
          margin-top:
            7px;
          color: #777;
          font-size:
            12px;
          line-height:
            1.4;
        }

        .collection-title {
          margin:
            0 0 17px;
          color: #222;
          font-size:
            18px;
          font-weight:
            800;
        }

        .radio-option {
          display: flex;
          align-items:
            flex-start;
          gap: 14px;
          margin-bottom:
            25px;
          cursor: pointer;
        }

        .radio-option:last-child {
          margin-bottom: 0;
        }

        .radio {
          width: 30px;
          height: 30px;
          margin-top:
            0;
          accent-color:
            #963f0d;
          flex:
            0 0 auto;
        }

        .radio-text {
          flex:
            1;
        }

        .radio-label {
          display: block;
          color: #222;
          font-size:
            19px;
          font-weight:
            800;
          line-height:
            1.3;
        }

        .radio-help {
          display: block;
          margin-top:
            10px;
          color: #666;
          font-size:
            15px;
          line-height:
            1.5;
        }

        .address {
          margin-top:
            8px;
          color: #777;
          font-size:
            13px;
          line-height:
            1.45;
        }

        /* ==========================================
           CUSTOMER DETAILS
        ========================================== */

        .customer-title {
          margin-bottom:
            22px;
        }

        /* ==========================================
           WARNING
        ========================================== */

        .warning {
          margin:
            8px 0 20px;
          padding:
            18px 20px;
          border-radius:
            14px;
          background:
            #fff0f0;
          color:
            #8b2f2f;
          font-size:
            17px;
          line-height:
            1.45;
        }

        /* ==========================================
           ERROR
        ========================================== */

        .error {
          margin-bottom:
            18px;
          padding:
            16px 18px;
          border-radius:
            13px;
          background:
            #fff0f0;
          border:
            1px solid #efcaca;
          color:
            #a52222;
          font-size:
            15px;
          font-weight:
            700;
          line-height:
            1.45;
        }

        /* ==========================================
           SUCCESS
        ========================================== */

        .success {
          margin-bottom:
            18px;
          padding:
            16px 18px;
          border-radius:
            13px;
          background:
            #edf8ee;
          border:
            1px solid #c8e5ca;
          color:
            #25632b;
          font-size:
            15px;
          font-weight:
            700;
          line-height:
            1.45;
        }

        /* ==========================================
           SUBMIT
        ========================================== */

        .submit {
          width: 100%;
          min-height:
            62px;
          border: none;
          border-radius:
            13px;
          background:
            #963f0d;
          color: white;
          font-size:
            21px;
          font-weight:
            900;
          cursor: pointer;
          box-shadow:
            0 4px 10px
              rgba(120, 50, 10, 0.16);
        }

        .submit:hover {
          background:
            #813609;
        }

        .submit:disabled {
          opacity:
            0.6;
          cursor:
            not-allowed;
        }

        /* ==========================================
           FOOTER
        ========================================== */

        .footer {
          padding:
            20px 10px 5px;
          text-align:
            center;
          color: #777;
          font-size:
            12px;
        }

        /* ==========================================
           MOBILE
        ========================================== */

        @media (
          max-width: 600px
        ) {

          .page {
            padding:
              10px 8px 30px;
          }

          .section {
            padding:
              20px 16px;
            border-radius:
              20px;
          }

          .header {
            padding:
              22px 15px;
          }

          .brand {
            font-size:
              29px;
          }

          .section-title {
            font-size:
              26px;
          }

          .menu-item {
            gap: 8px;
            padding:
              18px 0;
          }

          .item-name {
            font-size:
              17px;
          }

          .item-description {
            font-size:
              15px;
          }

          .item-price {
            font-size:
              18px;
          }

          .quantity {
            gap: 10px;
          }

          .quantity button {
            width: 50px;
            height: 50px;
            border-radius:
              10px;
            font-size:
              29px;
          }

          .quantity span {
            min-width:
              18px;
          }

          .radio-option {
            gap: 12px;
          }

          .radio-label {
            font-size:
              18px;
          }

          .radio-help {
            font-size:
              14px;
          }
        }

      `}</style>

      <main className="page">
        <div className="container">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="header">

            <h1 className="brand">
              ANNAI FOODS
            </h1>

            <p className="tagline">
              Fresh Homemade Idiyappam ❤️
            </p>

            <p className="subtag">
              Soft • Fresh • Healthy • Delicious
            </p>

            <p className="love">
              Fresh Homemade Idiyappam –
              Made with Love ❤️
            </p>

          </div>

          <form
            onSubmit={
              handleSubmit
            }
          >

            {/* ==================================================
                REGULAR IDIYAPPAM
            ================================================== */}

            <section className="section">

              <h2 className="section-title">
                REGULAR IDIYAPPAM
              </h2>

              {MENU
                .filter(
                  (item) =>
                    item.type ===
                    "idiyappam"
                )
                .map(
                  (item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                    />
                  )
                )}

            </section>

            {/* ==================================================
                KOTHU
            ================================================== */}

            <section className="section">

              <h2 className="section-title">
                KOTHU
              </h2>

              {MENU
                .filter(
                  (item) =>
                    item.name.includes(
                      "Kothu"
                    )
                )
                .map(
                  (item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                    />
                  )
                )}

            </section>

            {/* ==================================================
                GRAVY & KURMA
            ================================================== */}

            <section className="section">

              <h2 className="section-title">
                GRAVY & KURMA
              </h2>

              {MENU
                .filter(
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
                )
                .map(
                  (item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                    />
                  )
                )}

            </section>

            {/* ==================================================
                COMBOS
            ================================================== */}

            <section className="section">

              <h2 className="section-title">
                COMBOS
              </h2>

              {MENU
                .filter(
                  (item) =>
                    item.type ===
                    "combo"
                )
                .map(
                  (item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                    />
                  )
                )}

            </section>

            {/* ==================================================
                SIDES
            ================================================== */}

            <section className="section">

              <h2 className="section-title">
                SIDES
              </h2>

              {MENU
                .filter(
                  (item) =>
                    item.id ===
                    "coconut-milk"
                )
                .map(
                  (item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                    />
                  )
                )}

            </section>

            {/* ==================================================
                PARTY MENU
            ================================================== */}

            <section className="section">

              <h2 className="section-title">
                PARTY MENU – CHENNAI STYLE
                <br />
                DUM BIRYANI
              </h2>

              <p className="party-description">
                Minimum 5 plates.
                You can mix Lamb
                and Chicken Biryani.
              </p>

              {MENU
                .filter(
                  (item) =>
                    item.type ===
                    "party"
                )
                .map(
                  (item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                    />
                  )
                )}

            </section>

            {/* ==================================================
                ORDER SUMMARY
            ================================================== */}

            <section className="section">

              <h2 className="section-title">
                ORDER SUMMARY
              </h2>

              {cartItems.length ===
              0 ? (
                <p
                  style={{
                    color:
                      "#777",
                    fontSize:
                      "15px",
                  }}
                >
                  No items selected yet.
                </p>
              ) : (
                <>
                  {cartItems.map(
                    (item) => (
                      <div
                        key={
                          item.id
                        }
                        className="summary-row"
                      >
                        <span>
                          {item.name} ×{" "}
                          {
                            item.quantity
                          }
                        </span>

                        <strong>
                          R
                          {item.price *
                            item.quantity}
                        </strong>
                      </div>
                    )
                  )}

                  <div className="summary-row">
                    <span>
                      Total Selected Items
                    </span>

                    <strong>
                      {
                        totalSelectedItems
                      }
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span>
                      Total Idiyappam Plates
                    </span>

                    <strong>
                      {
                        totalIdiyappamPlates
                      }
                    </strong>
                  </div>

                  {totalPartyBiryaniPlates >
                    0 && (
                    <div className="summary-row">
                      <span>
                        Party Biryani Plates
                      </span>

                      <strong>
                        {
                          totalPartyBiryaniPlates
                        }
                      </strong>
                    </div>
                  )}

                  <div className="grand-total">

                    <span>
                      GRAND TOTAL
                    </span>

                    <span className="grand-total-value">
                      R
                      {
                        totalAmount
                      }
                    </span>

                  </div>
                </>
              )}

            </section>

            {/* ==================================================
                COLLECTION DETAILS
            ================================================== */}

            <section className="section">

              <h2 className="section-title">
                COLLECTION DETAILS
              </h2>

              {/* DATE */}

              <div className="field">

                <label className="label">
                  Collection Date
                </label>

                <input
                  className="input"
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
                />

                <div className="date-note">
                  Same-day collection
                  is available only
                  before 12:00 PM
                  Johannesburg time.
                </div>

              </div>

              {/* METHOD */}

              <div>

                <h3 className="collection-title">
                  Collection Method
                </h3>

                {/* HOME */}

                <label className="radio-option">

                  <input
                    className="radio"
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

                  <span className="radio-text">

                    <span className="radio-label">
                      Home collection
                    </span>

                    <span className="address">
                      {COLLECTION_ADDRESS}
                    </span>

                  </span>

                </label>

                {/* UBER */}

                <label className="radio-option">

                  <input
                    className="radio"
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

                  <span className="radio-text">

                    <span className="radio-label">
                      Uber pickup
                    </span>

                    <span className="radio-help">
                      For Uber pickup,
                      the customer must
                      arrange the Uber
                      driver to collect
                      from the address
                      above. Uber charges
                      are the customer's
                      responsibility.
                    </span>

                  </span>

                </label>

              </div>

            </section>

            {/* ==================================================
                CUSTOMER DETAILS
            ================================================== */}

            <section className="section">

              <h2 className="section-title customer-title">
                CUSTOMER DETAILS
              </h2>

              {/* NAME */}

              <div className="field">

                <label className="label">
                  Full Name
                </label>

                <input
                  className="input"
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
                />

              </div>

              {/* PHONE */}

              <div className="field">

                <label className="label">
                  WhatsApp / Contact Number
                </label>

                <input
                  className="input"
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
                />

              </div>

              {/* WARNING */}

              <div className="warning">
                The minimum regular
                order is 5 plates of
                Idiyappam. Combos
                count as 2 plates each.
              </div>

            </section>

            {/* ==================================================
                ERROR
            ================================================== */}

            {errorMessage && (
              <div className="error">
                {errorMessage}
              </div>
            )}

            {/* ==================================================
                SUCCESS
            ================================================== */}

            {successMessage && (
              <div className="success">
                {successMessage}
              </div>
            )}

            {/* ==================================================
                SUBMIT
            ================================================== */}

            <button
              type="submit"
              className="submit"
              disabled={
                loading
              }
            >
              {loading
                ? "Submitting Order..."
                : "Submit Order"}
            </button>

          </form>

          <div className="footer">
            ANNAI FOODS ❤️
          </div>

        </div>
      </main>
    </>
  );
}
