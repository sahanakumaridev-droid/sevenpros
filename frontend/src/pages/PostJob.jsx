import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const TIMES = ["As soon as possible", "Today", "Tomorrow", "This week", "Pick a day"];
const MAX_PHOTOS = 5;
const MAX_VIDEO_SEC = 40;

const EMPTY = {
  title: "",
  description: "",
  category: "Plumbing",
  city: "",
  zip_code: "",
  needed_by: "As soon as possible",
  needed_date: "",
  includes_product: false,
  product_note: "",
  image: "",
  images: [],
  video: "",
  video_seconds: 0,
};

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, 900 / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function loadVideoMeta(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement("video");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      const duration = el.duration;
      URL.revokeObjectURL(url);
      resolve(duration);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video"));
    };
    el.src = url;
  });
}

export default function PostJob() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    ...EMPTY,
    title: params.get("title") || "",
    category: params.get("category") || params.get("q") || "Plumbing",
  });
  const [mine, setMine] = useState([]);
  const [note, setNote] = useState("");
  const [step, setStep] = useState(1);
  const [previewIndex, setPreviewIndex] = useState(0);
  const navigate = useNavigate();
  const inFlow = Boolean(user);

  const load = () => {
    if (user) client.get("/credits/posts/mine").then((res) => setMine(res.data)).catch(() => {});
  };
  useEffect(load, [user]);

  const set = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }));

  const onPhotos = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = "";
    if (!files.length) return;
    const room = MAX_PHOTOS - form.images.length;
    if (room <= 0) {
      setNote(`You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }
    setNote("");
    try {
      const next = [];
      for (const file of files.slice(0, room)) {
        next.push(await compressImage(file));
      }
      setForm((current) => {
        const images = [...current.images, ...next].slice(0, MAX_PHOTOS);
        return { ...current, images, image: images[0] || "" };
      });
    } catch {
      setNote("One of the photos could not be added.");
    }
  };

  const removePhoto = (idx) => {
    setForm((current) => {
      const images = current.images.filter((_, i) => i !== idx);
      return { ...current, images, image: images[0] || "" };
    });
    setPreviewIndex(0);
  };

  const onVideo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setNote("");
    try {
      const duration = await loadVideoMeta(file);
      if (duration > MAX_VIDEO_SEC) {
        setNote(`Video must be ${MAX_VIDEO_SEC} seconds or less (yours is ${Math.ceil(duration)}s).`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setForm((current) => ({
          ...current,
          video: reader.result,
          video_seconds: Math.ceil(duration),
        }));
      };
      reader.readAsDataURL(file);
    } catch {
      setNote("Could not add this video.");
    }
  };

  const clearVideo = () => setForm((current) => ({ ...current, video: "", video_seconds: 0 }));

  const submit = async (e) => {
    e.preventDefault();
    setNote("");
    const needed = form.needed_by === "Pick a day" ? form.needed_date : form.needed_by;
    if (form.needed_by === "Pick a day" && !form.needed_date) {
      setNote("Choose the day you need the work.");
      return;
    }
    try {
      const res = await client.post("/credits/posts", {
        title: form.title,
        description: form.description,
        category: form.category,
        city: form.city,
        zip_code: form.zip_code,
        kind: "request",
        price: 0,
        image: form.image,
        images: form.images,
        video: form.video,
        video_seconds: form.video_seconds,
        needed_by: needed,
        includes_product: form.includes_product,
        product_note: form.includes_product ? form.product_note : "",
      });
      navigate(`/listings/${res.data.id}`);
    } catch (err) {
      setNote(err.response?.data?.detail || "Sign in to post a request");
    }
  };

  const field = "mt-1.5 h-12 w-full rounded-2xl border border-[#e3e6ea] bg-white px-3.5 text-base text-[#14181d] outline-none focus:border-[#2563eb]";

  const steps = ["Describe", "Details", "Preview"];
  const nextStep = () => setStep((s) => Math.min(3, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const showMediaBlock = !inFlow || step === 1 || step === 3;

  return (
    <div className={inFlow ? "text-[#14181d]" : "bg-[#f4f7fb] text-[#14181d]"}>
      <div className={`${inFlow ? "py-2" : "container-page"} max-w-3xl ${inFlow ? "" : "py-8 lg:py-12"}`}>
        <p className="text-[13px] font-semibold tracking-wide text-[#5b46f5]">Post a Project</p>
        <h1 className="mt-1 text-[28px] font-bold tracking-[-0.04em] sm:text-[32px]">What do you need?</h1>
        <p className="mt-2 text-[15px] text-[#64748b]">Add photos or a short video — up to {MAX_PHOTOS} images, {MAX_VIDEO_SEC}s video.</p>

        {inFlow && (
          <ol className="mt-6 flex gap-2">
            {steps.map((label, idx) => {
              const n = idx + 1;
              const active = step === n;
              const done = step > n;
              return (
                <li
                  key={label}
                  className={`flex-1 rounded-xl border px-3 py-2 text-center text-[12px] font-bold ${
                    active
                      ? "border-[#5b46f5] bg-[#EDE9FE] text-[#5b46f5]"
                      : done
                        ? "border-[#C7D2FE] bg-[#F8FAFC] text-[#4338CA]"
                        : "border-[#E7EAF0] bg-white text-[#94A3B8]"
                  }`}
                >
                  {n}. {label}
                </li>
              );
            })}
          </ol>
        )}

        <form
          onSubmit={(e) => {
            if (inFlow && step < 3) {
              e.preventDefault();
              if (step === 1 && !form.title.trim()) {
                setNote("Add a project title to continue.");
                return;
              }
              setNote("");
              nextStep();
              return;
            }
            submit(e);
          }}
          className="mt-6 rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(15,23,32,0.06)] sm:p-7"
        >
          {(!inFlow || step === 1) && (
            <>
              <label className="block text-sm font-semibold">
                Project title
                <input
                  value={form.title}
                  onChange={set("title")}
                  required
                  placeholder="Example: Bathroom plumbing repair"
                  className={field}
                />
              </label>
              <label className="mt-5 block text-sm font-semibold">
                A few details
                <textarea
                  value={form.description}
                  onChange={set("description")}
                  rows={4}
                  placeholder="What is happening, and anything the pro should know"
                  className={`${field} h-auto py-3`}
                />
              </label>
            </>
          )}

          {showMediaBlock && (
            <div className="mt-5 rounded-2xl border border-[#E7EAF0] bg-[#F8FAFC] p-4">
              <p className="text-sm font-semibold text-[#0b1220]">Photos & video</p>
              <p className="mt-1 text-[12px] text-[#64748b]">
                {form.images.length}/{MAX_PHOTOS} photos · video max {MAX_VIDEO_SEC}s
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex h-10 cursor-pointer items-center rounded-xl bg-[#5b46f5] px-4 text-[13px] font-semibold text-white">
                  Add photos
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={onPhotos} />
                </label>
                <label className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-[#E7EAF0] bg-white px-4 text-[13px] font-semibold text-[#334155]">
                  {form.video ? "Replace video" : "Add video"}
                  <input type="file" accept="video/*" className="sr-only" onChange={onVideo} />
                </label>
                {form.video && (
                  <button type="button" onClick={clearVideo} className="h-10 rounded-xl px-3 text-[13px] font-semibold text-[#9a3412]">
                    Remove video
                  </button>
                )}
              </div>
              {(form.images.length > 0 || form.video) && (
                <MediaPreview
                  form={form}
                  previewIndex={previewIndex}
                  setPreviewIndex={setPreviewIndex}
                  onRemovePhoto={removePhoto}
                />
              )}
            </div>
          )}

          {inFlow && step === 2 && (
            <>
              <label className="mt-0 block text-sm font-semibold">
                Project category
                <input value={form.category} onChange={set("category")} className={field} />
              </label>

              <fieldset className="mt-5">
                <legend className="text-sm font-semibold">When do you need it?</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TIMES.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, needed_by: time }))}
                      className={`h-11 rounded-full px-4 text-sm font-semibold ${form.needed_by === time ? "bg-[#071a3a] text-white" : "border border-[#e3e6ea] bg-white"}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                {form.needed_by === "Pick a day" && (
                  <input type="date" required value={form.needed_date} onChange={set("needed_date")} className={`${field} max-w-xs`} />
                )}
              </fieldset>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  ZIP code
                  <input value={form.zip_code} onChange={set("zip_code")} inputMode="numeric" autoComplete="postal-code" placeholder="94110" className={field} />
                </label>
                <label className="text-sm font-semibold">
                  City
                  <input value={form.city} onChange={set("city")} placeholder="San Francisco" className={field} />
                </label>
              </div>

              <label className="mt-5 flex items-start gap-3 text-base">
                <input
                  type="checkbox"
                  checked={form.includes_product}
                  onChange={(e) => setForm((current) => ({ ...current, includes_product: e.target.checked }))}
                  className="mt-1 size-5"
                />
                <span>This job includes a product or appliance, such as a part, fixture, or machine to supply or install.</span>
              </label>
              {form.includes_product && (
                <label className="mt-3 block text-sm font-semibold">
                  Which product or appliance?
                  <input value={form.product_note} onChange={set("product_note")} placeholder="Example: New kitchen faucet, customer will buy it" className={field} />
                </label>
              )}
            </>
          )}

          {inFlow && step === 3 && <ReviewStep form={form} previewIndex={previewIndex} setPreviewIndex={setPreviewIndex} />}

          {!inFlow && (
            <>
              <label className="mt-0 block text-sm font-semibold">
                Project category
                <input value={form.category} onChange={set("category")} className={field} />
              </label>
              <fieldset className="mt-5">
                <legend className="text-sm font-semibold">When do you need it?</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TIMES.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, needed_by: time }))}
                      className={`h-11 rounded-full px-4 text-sm font-semibold ${form.needed_by === time ? "bg-[#071a3a] text-white" : "border border-[#e3e6ea] bg-white"}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                {form.needed_by === "Pick a day" && (
                  <input type="date" required value={form.needed_date} onChange={set("needed_date")} className={`${field} max-w-xs`} />
                )}
              </fieldset>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  ZIP code
                  <input value={form.zip_code} onChange={set("zip_code")} inputMode="numeric" autoComplete="postal-code" placeholder="94110" className={field} />
                </label>
                <label className="text-sm font-semibold">
                  City
                  <input value={form.city} onChange={set("city")} placeholder="San Francisco" className={field} />
                </label>
              </div>
            </>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {inFlow && step > 1 && (
              <button type="button" onClick={prevStep} className="h-12 flex-1 rounded-xl border border-[#E7EAF0] text-[14px] font-semibold">
                Back
              </button>
            )}
            <button type="submit" className="h-12 flex-1 rounded-xl bg-[#5b46f5] text-[14px] font-bold text-white">
              {inFlow ? (step < 3 ? "Next Step →" : "Post Project") : "Post request"}
            </button>
          </div>
          {note && (
            <p className="mt-3 text-sm font-medium text-[#9a3412]" role="alert">
              {note}
            </p>
          )}
        </form>

        {mine.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold">Your requests</h2>
            <div className="mt-3 grid gap-3">
              {mine.map((job) => (
                <Link key={job.id} to={`/listings/${job.id}`} className="rounded-2xl bg-white p-4">
                  <p className="font-semibold">{job.title}</p>
                  <p className="mt-1 text-sm text-[#5c6770]">
                    {job.needed_by ? `Needed ${job.needed_by}` : "Time not set"}
                    {job.includes_product ? " · Product or appliance" : ""}
                    {job.quotes?.length ? ` · ${job.quotes.length} ${job.quotes.length === 1 ? "reply" : "replies"}` : " · Waiting for a pro"}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function MediaPreview({ form, previewIndex, setPreviewIndex, onRemovePhoto }) {
  const hero = form.images[previewIndex] || form.images[0];
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      {form.video && (
        <video src={form.video} controls playsInline className="max-h-56 w-full bg-black object-contain" />
      )}
      {!form.video && hero && (
        <img src={hero} alt="" className="h-56 w-full object-cover" />
      )}
      {form.images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-t border-[#EEF2F7] p-2">
          {form.images.map((src, idx) => (
            <button key={idx} type="button" onClick={() => setPreviewIndex(idx)} className="relative shrink-0">
              <img
                src={src}
                alt=""
                className={`h-16 w-16 rounded-lg object-cover ring-2 ${previewIndex === idx ? "ring-[#5b46f5]" : "ring-transparent"}`}
              />
            </button>
          ))}
        </div>
      )}
      {form.images.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-[#EEF2F7] p-2">
          {form.images.map((_, idx) => (
            <button key={idx} type="button" onClick={() => onRemovePhoto(idx)} className="text-[12px] font-semibold text-[#64748b]">
              Remove photo {idx + 1}
            </button>
          ))}
        </div>
      )}
      {form.video_seconds > 0 && (
        <p className="border-t border-[#EEF2F7] px-3 py-2 text-[12px] text-[#64748b]">Video · {form.video_seconds}s</p>
      )}
    </div>
  );
}

function ReviewStep({ form, previewIndex, setPreviewIndex }) {
  const when = form.needed_by === "Pick a day" ? form.needed_date : form.needed_by;
  return (
    <div className="mt-2 space-y-4">
      <p className="text-base font-bold text-[#0b1220]">Preview before you post</p>
      <article className="overflow-hidden rounded-[24px] border border-[#E7EAF0] bg-[#F8FAFC]">
        <MediaPreview form={form} previewIndex={previewIndex} setPreviewIndex={setPreviewIndex} onRemovePhoto={() => {}} />
        <div className="space-y-2 p-5 text-sm text-[#334155]">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#5b46f5]">{form.category}</p>
          <h3 className="text-xl font-bold text-[#0b1220]">{form.title || "—"}</h3>
          <p className="text-[#64748b]">Needed {when || "—"} · {[form.city, form.zip_code].filter(Boolean).join(", ") || "Location TBD"}</p>
          {form.description && <p className="whitespace-pre-wrap leading-relaxed">{form.description}</p>}
          {form.includes_product && (
            <p className="rounded-xl bg-white px-3 py-2 text-[13px]">Includes product: {form.product_note || "Yes"}</p>
          )}
        </div>
      </article>
      <p className="text-[12px] text-[#64748b]">Pros see this card in Find Jobs. Contact details stay protected until they unlock the lead.</p>
    </div>
  );
}