"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import {
  createExpenseCategoryAction,
  updateExpenseCategoryAction,
  deleteExpenseCategoryAction,
} from "@/app/(app)/expenses/actions";

type Category = { id: number; name: string; color: string };

const PRESET_COLORS = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#6b7280",
];

export function ExpenseCategoriesManager({
  categories: initial,
}: {
  categories: Category[];
}) {
  const [categories, setCategories] = useState(initial);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6b7280");
  const [showAdd, setShowAdd] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createExpenseCategoryAction({
        name: newName.trim(),
        color: newColor,
      });
      if (result.ok) {
        setCategories((prev) => [
          ...prev,
          { id: result.id, name: newName.trim(), color: newColor },
        ]);
        setNewName("");
        setNewColor("#6b7280");
        setShowAdd(false);
      } else {
        setError(result.error);
      }
    });
  };

  const handleUpdate = (id: number, name: string, color: string) => {
    setError(null);
    startTransition(async () => {
      const result = await updateExpenseCategoryAction(id, { name, color });
      if (result.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, name, color } : c)),
        );
        setEditingId(null);
      } else {
        setError(result.error);
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    startTransition(async () => {
      const result = await deleteExpenseCategoryAction(id);
      if (result.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    });
  };

  return (
    <div className="card p-5 space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}

      <div className="space-y-2">
        {categories.map((cat) => (
          <CategoryRow
            key={cat.id}
            category={cat}
            isEditing={editingId === cat.id}
            onEdit={() => setEditingId(cat.id)}
            onCancel={() => setEditingId(null)}
            onSave={(name, color) => handleUpdate(cat.id, name, color)}
            onDelete={() => handleDelete(cat.id)}
            disabled={isPending}
          />
        ))}
      </div>

      {showAdd ? (
        <div className="flex items-center gap-2 p-3 bg-rapid-bg rounded-lg">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre de la categoría"
            className="form-input flex-1"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <div className="flex gap-1">
            {PRESET_COLORS.slice(0, 5).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className="w-6 h-6 rounded-full border-2 transition"
                style={{
                  backgroundColor: c,
                  borderColor: newColor === c ? "#000" : "transparent",
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={isPending || !newName.trim()}
            className="btn-primary text-xs py-2"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowAdd(false)}
            className="btn-secondary text-xs py-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="btn-secondary text-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar categoría
        </button>
      )}
    </div>
  );
}

function CategoryRow({
  category,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  disabled,
}: {
  category: Category;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (name: string, color: string) => void;
  onDelete: () => void;
  disabled: boolean;
}) {
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-3 bg-rapid-bg rounded-lg">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-input flex-1"
          autoFocus
        />
        <div className="flex gap-1">
          {PRESET_COLORS.slice(0, 5).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full border-2 transition"
              style={{
                backgroundColor: c,
                borderColor: color === c ? "#000" : "transparent",
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => onSave(name, color)}
          disabled={disabled}
          className="btn-primary text-xs py-2"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary text-xs py-2">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-rapid-bg/50 transition">
      <span
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: category.color }}
      />
      <span className="flex-1 text-sm font-medium">{category.name}</span>
      <button
        type="button"
        onClick={onEdit}
        className="w-7 h-7 inline-flex items-center justify-center rounded-lg hover:bg-white text-rapid-text-muted hover:text-rapid-text"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        className="w-7 h-7 inline-flex items-center justify-center rounded-lg hover:bg-red-50 text-rapid-text-muted hover:text-red-600"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
