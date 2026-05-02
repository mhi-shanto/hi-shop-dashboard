import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  variantSchema,
  updateVariantSchema,
  type VariantFormValues,
  type UpdateVariantValues,
} from "../schemas/product.schema";
import type { ProductVariant } from "../schemas/types";
import useVariantMutations from "../hooks/useVariantMutations";
import { toast } from "sonner";

interface EditVariantFieldsProps {
  productId: string;
  variants: ProductVariant[];
  onRefresh: () => void;
}

const parseDecimalNum = (
  d: { s: number; e: number; d: number[] } | number,
): number => {
  if (typeof d === "number") return d;
  if (!d || !d.d || d.d.length === 0) return 0;
  return d.s * d.d[0] * Math.pow(10, d.e - (d.d.length - 1));
};

interface VariantEditRowProps {
  variant: ProductVariant;
  productId: string;
  onRefresh: () => void;
  updatingId: string | null;
  deletingId: string | null;
  onUpdate: (
    variantId: string,
    data: UpdateVariantValues,
  ) => Promise<{ success: boolean; error?: string }>;
  onDelete: (
    variantId: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

const VariantEditRow = ({
  variant,
  onRefresh,
  updatingId,
  deletingId,
  onUpdate,
  onDelete,
}: VariantEditRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateVariantValues>({
    resolver: zodResolver(updateVariantSchema) as Resolver<UpdateVariantValues>,
    defaultValues: {
      sku: variant.sku,
      size: variant.size ?? "",
      color: variant.color ?? "",
      stock: variant.stock,
      priceModifier: parseDecimalNum(variant.priceModifier) || undefined,
      isActive: variant.isActive,
    },
  });

  const handleEdit = () => {
    reset({
      sku: variant.sku,
      size: variant.size ?? "",
      color: variant.color ?? "",
      stock: variant.stock,
      priceModifier: parseDecimalNum(variant.priceModifier) || undefined,
      isActive: variant.isActive,
    });
    setIsEditing(true);
    setRowError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setRowError(null);
  };

  const onSubmit = async (data: UpdateVariantValues) => {
    setRowError(null);
    const result = await onUpdate(variant.id, data);
    if (result.success) {
      setIsEditing(false);
      onRefresh();
    } else {
      setRowError(result.error ?? "Failed to update.");
    }
  };

  const handleDelete = async () => {
    setRowError(null);
    const result = await onDelete(variant.id);
    if (result.success) {
      onRefresh();
    } else {
      setRowError(result.error ?? "Failed to delete.");
      setConfirmDelete(false);
    }
  };

  const isSaving = updatingId === variant.id;
  const isDeleting = deletingId === variant.id;

  if (isEditing) {
    return (
      <div className="bg-primary/5 rounded-xl p-4 ghost-border border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-primary">
            Editing variant
          </span>
          <button
            type="button"
            onClick={handleCancel}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {rowError && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-3">
            <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
            <p className="text-xs text-destructive">{rowError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label-text text-[10px] mb-1 block">SKU</label>
              <Input {...register("sku")} placeholder="e.g. PROD-SM-BLK" />
              {errors.sku && (
                <p className="text-xs text-destructive mt-1">
                  {errors.sku.message}
                </p>
              )}
            </div>
            <div>
              <label className="label-text text-[10px] mb-1 block">Size</label>
              <Input {...register("size")} placeholder="e.g. S, M, L" />
            </div>
            <div>
              <label className="label-text text-[10px] mb-1 block">Color</label>
              <Input {...register("color")} placeholder="e.g. Black" />
            </div>
            <div>
              <label className="label-text text-[10px] mb-1 block">Stock</label>
              <Input
                type="number"
                min={0}
                {...register("stock")}
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-xs text-destructive mt-1">
                  {errors.stock.message}
                </p>
              )}
            </div>
            <div>
              <label className="label-text text-[10px] mb-1 block">
                Price Modifier ($)
              </label>
              <Input
                type="number"
                step="0.01"
                min={0}
                {...register("priceModifier")}
                placeholder="0.00"
              />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id={`edit-isActive-${variant.id}`}
                {...register("isActive")}
                className="h-4 w-4 rounded accent-primary"
              />
              <label
                htmlFor={`edit-isActive-${variant.id}`}
                className="text-xs text-on-surface-variant cursor-pointer"
              >
                Active
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="flex-1 gap-1.5"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Save
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low rounded-xl px-4 py-3 ghost-border">
      {rowError && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-3">
          <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
          <p className="text-xs text-destructive">{rowError}</p>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-on-surface font-mono">
              {variant.sku}
            </span>
            {variant.size && (
              <span className="text-xs bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">
                {variant.size}
              </span>
            )}
            {variant.color && (
              <span className="text-xs bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">
                {variant.color}
              </span>
            )}
            {!variant.isActive && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                Inactive
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1.5">
            <span className="text-xs text-on-surface-variant">
              Stock:{" "}
              <span className="font-semibold text-on-surface">
                {variant.stock}
              </span>
            </span>
            {parseDecimalNum(variant.priceModifier) > 0 && (
              <span className="text-xs text-on-surface-variant">
                Modifier:{" "}
                <span className="font-semibold text-on-surface">
                  +${parseDecimalNum(variant.priceModifier).toFixed(2)}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-on-surface-variant mr-1">
                Delete?
              </span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Yes"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setConfirmDelete(false)}
              >
                No
              </Button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleEdit}
                className="text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-surface-container"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-on-surface-variant hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AddVariantForm = ({
  onAdd,
  isAdding,
}: {
  onAdd: (
    data: VariantFormValues,
  ) => Promise<{ success: boolean; error?: string }>;
  isAdding: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema) as Resolver<VariantFormValues>,
    defaultValues: {
      sku: "",
      size: "",
      color: "",
      stock: 0,
      priceModifier: undefined,
      isActive: true,
    },
  });

  const onSubmit = async (data: VariantFormValues) => {
    setFormError(null);
    const result = await onAdd(data);
    if (result.success) {
      reset();
      setIsOpen(false);
      toast.success("Variant added successfully", {
        description: "The variant has been added successfully.",
        duration: 2000,
        position: "top-center",
      });
    } else {
      setFormError(result.error ?? "Failed to add variant.");
      toast.error("Failed to add variant.", {
        description: "The variant has not been added.",
        duration: 2000,
        position: "top-center",
      });
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-on-surface-variant hover:text-primary border-2 border-dashed border-outline-variant/20 hover:border-primary/30 rounded-xl transition-all duration-200"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Variant
      </button>
    );
  }

  return (
    <div className="bg-tertiary/5 rounded-xl p-4 border-2 border-dashed border-tertiary/20">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-tertiary">New Variant</span>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setFormError(null);
            reset();
          }}
          className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {formError && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-3">
          <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
          <p className="text-xs text-destructive">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label-text text-[10px] mb-1 block">
              SKU <span className="text-destructive">*</span>
            </label>
            <Input {...register("sku")} placeholder="e.g. PROD-XL-WHT" />
            {errors.sku && (
              <p className="text-xs text-destructive mt-1">
                {errors.sku.message}
              </p>
            )}
          </div>
          <div>
            <label className="label-text text-[10px] mb-1 block">Size</label>
            <Input {...register("size")} placeholder="e.g. XL" />
          </div>
          <div>
            <label className="label-text text-[10px] mb-1 block">Color</label>
            <Input {...register("color")} placeholder="e.g. White" />
          </div>
          <div>
            <label className="label-text text-[10px] mb-1 block">
              Stock <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              min={0}
              {...register("stock")}
              placeholder="0"
            />
            {errors.stock && (
              <p className="text-xs text-destructive mt-1">
                {errors.stock.message}
              </p>
            )}
          </div>
          <div>
            <label className="label-text text-[10px] mb-1 block">
              Price Modifier ($)
            </label>
            <Input
              type="number"
              step="0.01"
              min={0}
              {...register("priceModifier")}
              placeholder="0.00"
            />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="new-variant-isActive"
              {...register("isActive")}
              defaultChecked
              className="h-4 w-4 rounded accent-primary"
            />
            <label
              htmlFor="new-variant-isActive"
              className="text-xs text-on-surface-variant cursor-pointer"
            >
              Active
            </label>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              setIsOpen(false);
              setFormError(null);
              reset();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="flex-1 gap-1.5"
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Add Variant
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

const EditVariantFields = ({
  productId,
  variants,
  onRefresh,
}: EditVariantFieldsProps) => {
  const { add, update, remove, isAdding, updatingId, deletingId } =
    useVariantMutations(productId);

  return (
    <div className="bg-card rounded-2xl p-5 ghost-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="label-text text-primary text-[10px]">VARIANTS</span>
          <h3 className="text-sm font-bold text-on-surface mt-0.5">
            Product Variants
            <span className="ml-2 text-xs font-normal text-on-surface-variant">
              ({variants.length})
            </span>
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {variants.map((variant) => (
          <VariantEditRow
            key={variant.id}
            variant={variant}
            productId={productId}
            onRefresh={onRefresh}
            updatingId={updatingId}
            deletingId={deletingId}
            onUpdate={update}
            onDelete={remove}
          />
        ))}

        <AddVariantForm onAdd={add} isAdding={isAdding} />
      </div>
    </div>
  );
};

export default EditVariantFields;
