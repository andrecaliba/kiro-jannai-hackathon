"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import { CATEGORIES, LOCATIONS } from "@/lib/constants";
import Card from "@/components/ui/Card";

interface ItemFormProps {
  type: "lost" | "found";
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  date?: string;
  reporter_name?: string;
  contact_email?: string;
}

const inputClass =
  "border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-ust-gold";

const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function ItemForm({ type }: ItemFormProps) {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const addItem = useStore((s) => s.addItem);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [reporterName, setReporterName] = useState(user?.name ?? "");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (!title.trim()) newErrors.title = "Item name is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (!category.trim()) newErrors.category = "Category is required.";
    if (!location.trim()) newErrors.location = "Location is required.";
    if (!date.trim()) newErrors.date = "Date is required.";
    if (!reporterName.trim()) newErrors.reporter_name = "Reporter name is required.";
    if (!contactEmail.trim()) newErrors.contact_email = "Contact email is required.";

    return newErrors;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    addItem({
      type,
      title: title.trim(),
      description: description.trim(),
      category,
      location,
      date,
      image_url: imageUrl.trim() || undefined,
      status: "open",
      reporter_name: reporterName.trim(),
      contact_email: contactEmail.trim(),
    });

    router.push("/dashboard");
  }

  const submitButtonClass =
    type === "lost"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-ust-gold text-ust-black hover:bg-yellow-400";

  const submitLabel =
    type === "lost" ? "Report Lost Item" : "Report Found Item";

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5">
          {/* Item Name */}
          <div>
            <label htmlFor="title" className={labelClass}>
              Item Name
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="e.g. Black Samsung Galaxy S23"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={inputClass}
              placeholder="Provide a detailed description of the item..."
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className={labelClass}>
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className={labelClass}>
              Location
            </label>
            <select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a location</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            {errors.location && (
              <p className="text-red-500 text-xs mt-1">{errors.location}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className={labelClass}>
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          {/* Image URL (optional) */}
          <div>
            <label htmlFor="imageUrl" className={labelClass}>
              Image URL{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="imageUrl"
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={inputClass}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Reporter Name */}
          <div>
            <label htmlFor="reporterName" className={labelClass}>
              Reporter Name
            </label>
            <input
              id="reporterName"
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className={inputClass}
              placeholder="Your full name"
            />
            {errors.reporter_name && (
              <p className="text-red-500 text-xs mt-1">{errors.reporter_name}</p>
            )}
          </div>

          {/* Contact Email */}
          <div>
            <label htmlFor="contactEmail" className={labelClass}>
              Contact Email
            </label>
            <input
              id="contactEmail"
              type="text"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputClass}
              placeholder="yourname@ust.edu.ph"
            />
            {errors.contact_email && (
              <p className="text-red-500 text-xs mt-1">{errors.contact_email}</p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${submitButtonClass}`}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </form>
    </Card>
  );
}
