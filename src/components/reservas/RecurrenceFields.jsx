import React from "react";

const RecurrenceFields = ({ formData, errors, handleInputChange }) => {
  const labelStyle = {
    fontFamily: "Lato, sans-serif",
    fontSize: "10px",
    fontWeight: "bold",
    color: "#535964",
  };

  return (
    <div>
      <div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <span className="text-sm font-medium" style={labelStyle}>
            RECORRENTE
          </span>
          <input
            type="checkbox"
            name="is_recurring"
            checked={formData.is_recurring}
            onChange={handleInputChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
      </div>

      {formData.is_recurring && (
        <div className="mt-6 flex flex-col md:flex-row gap-4 md:gap-8">
          <div className="w-full md:w-32">
            <label className="block mb-2" style={labelStyle}>
              FREQUÊNCIA
            </label>
            <select
              name="recurrence_frequency"
              value={formData.recurrence_frequency}
              onChange={handleInputChange}
              className="w-full pt-2 pb-3 border-0 border-b focus:outline-none focus:border-blue-500"
              style={{
                borderBottomColor: "#E3E5E8"
              }}
            >
              <option value="daily">Diária</option>
              <option value="weekly">Semanal</option>
              <option value="biweekly">Quinzenal</option>
            </select>
          </div>
          <div className="w-full md:w-36">
            <label className="block mb-2" style={labelStyle}>
              DATA FINAL
            </label>
            <input
              type="date"
              name="recurrence_end_date"
              value={formData.recurrence_end_date}
              onChange={handleInputChange}
              min={formData.date}
              max="2099-12-31"
              className={`w-full py-2 border-0 border-b focus:outline-none focus:border-blue-500 ${
                errors.recurrence_end_date ? "border-red-500" : ""
              }`}
              style={{
                borderBottomColor: errors.recurrence_end_date ? "#ef4444" : "#E3E5E8"
              }}
            />
            {errors.recurrence_end_date && <p className="mt-1 text-sm text-red-600">{errors.recurrence_end_date}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurrenceFields;

