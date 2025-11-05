import React from "react";
import { Monitor, Wifi, AirVent } from "lucide-react";

const FormFields = ({
  formData,
  errors,
  handleInputChange,
  roomResources = [
    { key: 'projector', label: 'Projetor', icon: Monitor },
    { key: 'internet', label: 'Internet', icon: Wifi },
    { key: 'air_conditioning', label: 'Ar Condicionado', icon: AirVent }
  ]
}) => {
  const labelStyle = {
    fontFamily: "Lato, sans-serif",
    fontSize: "10px",
    fontWeight: "bold",
    color: "#535964",
  };

  return (
    <>
      {/* Descrição */}
      <div>
        <label className="block mb-2" style={labelStyle}>
          DESCRIÇÃO
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className={`w-full py-2 border-0 border-b focus:outline-none focus:border-blue-500 resize-none ${
            errors.description ? "border-red-500" : ""
          }`}
          style={{
            borderBottomColor: errors.description ? "#ef4444" : "#E3E5E8"
          }}
          placeholder="Descreva o propósito da reserva..."
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      {/* Data, Horários e Participantes */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        <div className="flex-1">
          <label className="block mb-2" style={labelStyle}>
            DATA
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            max="2099-12-31"
            className={`w-full py-2 border-0 border-b focus:outline-none focus:border-blue-500 ${
              errors.date ? "border-red-500" : ""
            }`}
            style={{
              borderBottomColor: errors.date ? "#ef4444" : "#E3E5E8"
            }}
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
        </div>
        <div className="w-full md:w-20">
          <label className="block mb-2" style={labelStyle}>
            INÍCIO
          </label>
          <input
            type="time"
            name="start_time"
            value={formData.start_time}
            onChange={handleInputChange}
            className={`w-full py-2 border-0 border-b focus:outline-none focus:border-blue-500 ${
              errors.start_time ? "border-red-500" : ""
            }`}
            style={{
              borderBottomColor: errors.start_time ? "#ef4444" : "#E3E5E8"
            }}
          />
          {errors.start_time && <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>}
        </div>
        <div className="w-full md:w-20">
          <label className="block mb-2" style={labelStyle}>
            FIM
          </label>
          <input
            type="time"
            name="end_time"
            value={formData.end_time}
            onChange={handleInputChange}
            className={`w-full py-2 border-0 border-b focus:outline-none focus:border-blue-500 ${
              errors.end_time ? "border-red-500" : ""
            }`}
            style={{
              borderBottomColor: errors.end_time ? "#ef4444" : "#E3E5E8"
            }}
          />
          {errors.end_time && <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>}
        </div>
        <div className="w-full md:w-16">
          <label className="block mb-2" style={labelStyle}>
            PARTICIPANTES
          </label>
          <input
            type="number"
            name="people_count"
            value={formData.people_count}
            onChange={handleInputChange}
            min="1"
            max="999"
            maxLength="3"
            placeholder="0"
            className={`w-full py-2 border-0 border-b focus:outline-none focus:border-blue-500 ${
              errors.people_count ? "border-red-500" : ""
            }`}
            style={{
              borderBottomColor: errors.people_count ? "#ef4444" : "#E3E5E8"
            }}
          />
          {errors.people_count && <p className="mt-1 text-sm text-red-600">{errors.people_count}</p>}
        </div>
      </div>

      {/* Recursos */}
      <div>
        <label className="block mb-2" style={labelStyle}>
          RECURSOS
        </label>
        <div className="flex flex-wrap gap-4">
          {roomResources.map(resource => {
            const IconComponent = resource.icon;
            return (
              <label key={resource.key} className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  name={resource.key}
                  checked={formData.room_resources[resource.key]}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <IconComponent size={16} className="text-gray-600" />
                <span className="text-sm text-gray-700">{resource.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default FormFields;

