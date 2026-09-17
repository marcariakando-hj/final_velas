import React, { useState } from "react";
import {
  Star,
  MessageSquare,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  LogIn,
  AlertCircle,
  Filter,
  Send,
  User,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { CandleReview } from "../types";

interface ReviewsSectionProps {
  onOpenAuth: () => void;
  onOpenAdmin?: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  onOpenAuth,
  onOpenAdmin,
}) => {
  const { reviews, addReview, updateReview, deleteReview, currentUser, candles } = useStore();

  // New review form state
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [commentText, setCommentText] = useState("");
  const [selectedCandleName, setSelectedCandleName] = useState<string>("");
  const [userLocation, setUserLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Edit review state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editHoverRating, setEditHoverRating] = useState(0);

  // Filter state
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [onlyMine, setOnlyMine] = useState(false);

  // Confirmation dialog for deletion
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : "5.0";

  const totalReviews = reviews.length;

  // Filtered reviews
  const filteredReviews = reviews.filter((rev) => {
    if (ratingFilter !== "all" && rev.rating !== ratingFilter) return false;
    if (onlyMine && currentUser) {
      const isMine =
        (rev.userId && rev.userId === currentUser.id) ||
        (rev.userEmail && rev.userEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
        (!rev.userId && rev.author.toLowerCase() === currentUser.name.toLowerCase());
      if (!isMine) return false;
    }
    return true;
  });

  const handleStartReview = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setIsWriting(true);
    setFeedback(null);
  };

  const handleSubmitNewReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!commentText.trim()) {
      setFeedback({ type: "error", message: "Por favor escribe tu reseña o comentario." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const res = await addReview({
      comment: commentText,
      rating: rating,
      author: currentUser.name,
      location: userLocation.trim() || currentUser.city || "España",
      candleName: selectedCandleName.trim() || "Vela Artesanal Ayllu",
    });

    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: "success", message: res.message });
      setCommentText("");
      setRating(5);
      setSelectedCandleName("");
      setUserLocation("");
      setIsWriting(false);
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: "error", message: res.message });
    }
  };

  const handleStartEdit = (rev: CandleReview) => {
    setEditingReviewId(rev.id);
    setEditCommentText(rev.comment);
    setEditRating(rev.rating || 5);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditCommentText("");
    setEditRating(5);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editCommentText.trim()) return;

    const res = await updateReview(id, {
      comment: editCommentText.trim(),
      rating: editRating,
    });

    if (res.success) {
      setFeedback({ type: "success", message: "Comentario editado con éxito." });
      setEditingReviewId(null);
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: "error", message: res.message });
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteReview(id);
    setDeleteConfirmId(null);
    if (res.success) {
      setFeedback({ type: "success", message: res.message });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: "error", message: res.message });
    }
  };

  const isMyReview = (rev: CandleReview) => {
    if (!currentUser) return false;
    return (
      (rev.userId && rev.userId === currentUser.id) ||
      (rev.userEmail && rev.userEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      (!rev.userId && rev.author.toLowerCase() === currentUser.name.toLowerCase())
    );
  };

  const isAdmin = currentUser?.role === "administrador";

  return (
    <section id="comentarios-section" className="py-20 bg-[#F2EDE7] border-y border-[#E5E0DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header with Title and Global Rating */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#E5E0DA]/80">
          <div className="text-center md:text-left space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5E0DA] text-[#6B5E54] text-[11px] font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#8C7A6B]" />
              Experiencias Reales
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#423D33] font-normal tracking-tight">
              La Calma en los Hogares
            </h2>
            <p className="text-sm text-[#423D33]/70 max-w-xl">
              Historias, aromas y sensaciones compartidas por la comunidad que enciende momentos con Ayllu.
            </p>
          </div>

          {/* Stats badge & Call to action */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white px-5 py-3 rounded-2xl border border-[#E5E0DA] shadow-xs flex items-center gap-4">
              <div className="text-center">
                <span className="text-2xl font-serif font-bold text-[#423D33]">{averageRating}</span>
                <span className="text-xs text-[#8C7A6B]"> / 5</span>
              </div>
              <div className="h-8 w-px bg-[#E5E0DA]" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(Number(averageRating))
                          ? "fill-[#8C7A6B] text-[#8C7A6B]"
                          : "text-[#D1C7BD]"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-[#8C7A6B] font-medium">
                  {totalReviews} {totalReviews === 1 ? "reseña verificada" : "reseñas verificadas"}
                </p>
              </div>
            </div>

            {/* Action button */}
            {!isWriting && (
              <button
                id="btn-open-review-form"
                onClick={handleStartReview}
                className="px-5 py-3 rounded-2xl bg-[#423D33] hover:bg-[#2C2822] text-white text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                {currentUser ? "Escribir Reseña" : "Iniciar Sesión para Opinar"}
              </button>
            )}
          </div>
        </div>

        {/* Global Feedback message */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-medium ${
              feedback.type === "success"
                ? "bg-[#608058]/10 text-[#3F5A38] border-[#608058]/30"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-[#608058] shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-[#423D33]/60 hover:text-[#423D33] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Guest Invite Card (when user is not logged in and not writing) */}
        {!currentUser && !isWriting && (
          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E5E0DA] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-full bg-[#E5E0DA]/70 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-[#8C7A6B]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#423D33]">
                  ¿Tienes una vela Ayllu en tu hogar?
                </p>
                <p className="text-[11px] text-[#423D33]/70">
                  Inicia sesión para compartir tu experiencia, valorar aromas y ayudar a otros amantes de las velas.
                </p>
              </div>
            </div>
            <button
              id="btn-guest-login-reviews"
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-white border border-[#D1C7BD] text-xs font-semibold text-[#423D33] hover:bg-[#E5E0DA]/30 transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 text-[#8C7A6B]" />
              Iniciar Sesión
            </button>
          </div>
        )}

        {/* New Review Creation Form (Only accessible when logged in) */}
        {isWriting && currentUser && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D1C7BD] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-4">
              <div className="space-y-0.5">
                <h3 className="font-serif text-lg font-bold text-[#423D33]">
                  Comparte tu experiencia con Ayllu
                </h3>
                <p className="text-xs text-[#8C7A6B]">
                  Publicando como <strong className="text-[#423D33]">{currentUser.name}</strong> ({currentUser.email})
                </p>
              </div>
              <button
                onClick={() => setIsWriting(false)}
                className="p-1.5 rounded-full hover:bg-[#F2EDE7] text-[#8C7A6B] hover:text-[#423D33] transition-all cursor-pointer"
                title="Cerrar formulario"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewReview} className="space-y-5">
              {/* Star Rating Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#423D33]">
                  Calificación general:
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 rounded-lg hover:bg-[#F2EDE7] transition-all cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-[#8C7A6B] text-[#8C7A6B]"
                            : "text-[#D1C7BD]"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#423D33] ml-2">
                    {hoverRating || rating} de 5 estrellas
                  </span>
                </div>
              </div>

              {/* Candle and Location details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#423D33]">
                    Vela o experiencia relacionada:
                  </label>
                  <select
                    value={selectedCandleName}
                    onChange={(e) => setSelectedCandleName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E5E0DA] rounded-xl text-xs text-[#423D33] focus:outline-none focus:border-[#8C7A6B]"
                  >
                    <option value="">Vela Artesanal Ayllu (General)</option>
                    {candles.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value="Personalización a Medida">Personalización a Medida</option>
                    <option value="Pack de Regalo">Pack de Regalo</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#423D33]">
                    Tu Ciudad / Ubicación (opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Madrid, Sevilla, Valencia..."
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E5E0DA] rounded-xl text-xs text-[#423D33] placeholder-[#8C7A6B]/50 focus:outline-none focus:border-[#8C7A6B]"
                  />
                </div>
              </div>

              {/* Comment Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#423D33]">
                  Tu opinión o comentario: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="¿Cómo fue el encendido? ¿Qué te pareció el aroma, el diseño o la presentación? Nos encanta leerte..."
                  className="w-full p-3.5 bg-[#FAF7F2] border border-[#E5E0DA] rounded-xl text-xs text-[#423D33] placeholder-[#8C7A6B]/50 focus:outline-none focus:border-[#8C7A6B] leading-relaxed resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWriting(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#D1C7BD] text-xs font-semibold text-[#6B5E54] hover:bg-[#F2EDE7] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#423D33] hover:bg-[#2C2822] disabled:opacity-50 text-white text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Publicando..." : "Publicar Comentario"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and sorting bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#6B5E54] flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#8C7A6B]" />
              Filtrar:
            </span>

            <button
              onClick={() => setRatingFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                ratingFilter === "all"
                  ? "bg-[#423D33] text-white shadow-2xs"
                  : "bg-white text-[#423D33] border border-[#E5E0DA] hover:bg-[#E5E0DA]/30"
              }`}
            >
              Todos ({reviews.length})
            </button>

            {[5, 4, 3].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              return (
                <button
                  key={stars}
                  onClick={() => setRatingFilter(stars)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    ratingFilter === stars
                      ? "bg-[#423D33] text-white shadow-2xs"
                      : "bg-white text-[#423D33] border border-[#E5E0DA] hover:bg-[#E5E0DA]/30"
                  }`}
                >
                  <span>{stars}</span>
                  <Star className={`w-3 h-3 ${ratingFilter === stars ? "fill-white" : "fill-[#8C7A6B] text-[#8C7A6B]"}`} />
                  <span className="text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}

            {currentUser && (
              <button
                onClick={() => setOnlyMine(!onlyMine)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  onlyMine
                    ? "bg-[#8C7A6B] text-white shadow-2xs"
                    : "bg-white text-[#423D33] border border-[#E5E0DA] hover:bg-[#E5E0DA]/30"
                }`}
              >
                <User className="w-3 h-3" />
                Mis Comentarios
              </button>
            )}
          </div>

          {/* Admin link badge */}
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="text-xs font-semibold text-[#8C7A6B] hover:text-[#423D33] underline flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Moderar en Panel de Administración
            </button>
          )}
        </div>

        {/* Reviews Grid */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#E5E0DA] text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-[#8C7A6B]/50 mx-auto" />
            <p className="font-serif text-base text-[#423D33]">No hay comentarios con este filtro</p>
            <p className="text-xs text-[#8C7A6B]">
              Intenta cambiar el filtro de estrellas o escribe tu propia reseña.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredReviews.map((rev) => {
              const mine = isMyReview(rev);
              const canEdit = mine; // Only owner can edit
              const canDelete = mine || isAdmin; // Owner can delete own, admin can delete any
              const isCurrentlyEditing = editingReviewId === rev.id;

              return (
                <div
                  key={rev.id}
                  className={`p-6 rounded-3xl border shadow-xs space-y-4 flex flex-col justify-between transition-all ${
                    mine
                      ? "bg-white border-[#8C7A6B]/40 ring-1 ring-[#8C7A6B]/20"
                      : "bg-white border-[#E5E0DA]"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header of review: Stars & Role Badges */}
                    <div className="flex items-center justify-between">
                      {isCurrentlyEditing ? (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onMouseEnter={() => setEditHoverRating(star)}
                              onMouseLeave={() => setEditHoverRating(0)}
                              onClick={() => setEditRating(star)}
                              className="p-0.5 cursor-pointer"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  star <= (editHoverRating || editRating)
                                    ? "fill-[#8C7A6B] text-[#8C7A6B]"
                                    : "text-[#D1C7BD]"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3.5 h-3.5 fill-[#8C7A6B] text-[#8C7A6B]"
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        {mine && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#8C7A6B] bg-[#8C7A6B]/10 px-2 py-0.5 rounded-full border border-[#8C7A6B]/20">
                            Tu Comentario
                          </span>
                        )}
                        {rev.verified && !mine && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#608058] bg-[#608058]/10 px-2 py-0.5 rounded-full border border-[#608058]/20">
                            Verificada
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Review Body: Normal or Inline Edit */}
                    {isCurrentlyEditing ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          rows={3}
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="w-full p-2.5 bg-[#FAF7F2] border border-[#8C7A6B] rounded-xl text-xs text-[#423D33] focus:outline-none resize-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={handleCancelEdit}
                            className="px-2.5 py-1 text-[11px] font-semibold text-[#6B5E54] hover:bg-[#F2EDE7] rounded-lg transition-all cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveEdit(rev.id)}
                            className="px-3 py-1 bg-[#423D33] text-white text-[11px] font-semibold rounded-lg hover:bg-[#2C2822] transition-all cursor-pointer"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#423D33]/85 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    )}
                  </div>

                  {/* Footer of Card: Author info and Actions */}
                  <div className="pt-3 border-t border-[#E5E0DA] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-medium text-[#423D33] block">
                          {rev.author}
                        </span>
                        <span className="text-[10px] text-[#8C7A6B]">
                          {rev.location || "España"} • {rev.candleName || "Vela Artesanal"}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8C7A6B]/80">{rev.date}</span>
                    </div>

                    {/* Actions Row (for Owner or Admin) */}
                    {(canEdit || canDelete) && !isCurrentlyEditing && (
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#E5E0DA]/50">
                        {canEdit && (
                          <button
                            onClick={() => handleStartEdit(rev)}
                            className="text-[11px] text-[#6B5E54] hover:text-[#423D33] font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-[#F2EDE7] transition-all cursor-pointer"
                            title="Editar mi comentario"
                          >
                            <Edit2 className="w-3 h-3 text-[#8C7A6B]" />
                            Editar
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => setDeleteConfirmId(rev.id)}
                            className={`text-[11px] font-medium flex items-center gap-1 px-2 py-1 rounded transition-all cursor-pointer ${
                              isAdmin && !mine
                                ? "text-rose-600 hover:bg-rose-50"
                                : "text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            }`}
                            title={isAdmin && !mine ? "Eliminar comentario como Administrador" : "Eliminar mi comentario"}
                          >
                            <Trash2 className="w-3 h-3" />
                            {isAdmin && !mine ? "Admin • Eliminar" : "Eliminar"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation modal for deleting review */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#E5E0DA] shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="font-serif text-lg font-bold text-[#423D33]">
                  ¿Eliminar este comentario?
                </h4>
                <p className="text-xs text-[#8C7A6B]">
                  Esta acción no se puede deshacer y se eliminará de la base de datos de Ayllu.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="w-1/2 py-2 rounded-xl border border-[#D1C7BD] text-xs font-semibold text-[#6B5E54] hover:bg-[#F2EDE7] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="w-1/2 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
