import { createClient } from '@supabase/supabase-js';

// ─── Supabase Client ───
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.\n' +
    'The app will fall back to localStorage.'
  );
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// ─── URL Helpers ───
// The customer slug comes from the URL: ?c=wrts
export function getSlugFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('c') || null;
}

export function setSlugInURL(slug) {
  const url = new URL(window.location);
  url.searchParams.set('c', slug);
  window.history.replaceState({}, '', url);
}

// ─── Customer Config ───

/**
 * Load a customer config by slug.
 * Returns { id, slug, customer_name, model, logo_url } or null.
 */
export async function loadCustomer(slug) {
  if (!supabase) {
    // Fallback: localStorage
    const raw = localStorage.getItem(`roller-cfg-${slug}`);
    return raw ? JSON.parse(raw) : null;
  }

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Create or update a customer config.
 * Returns the saved customer row.
 */
export async function saveCustomer({ slug, customer_name, model, logo_url }) {
  if (!supabase) {
    const obj = { id: slug, slug, customer_name, model, logo_url };
    localStorage.setItem(`roller-cfg-${slug}`, JSON.stringify(obj));
    return obj;
  }

  const { data, error } = await supabase
    .from('customers')
    .upsert(
      { slug, customer_name, model, logo_url },
      { onConflict: 'slug' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error saving customer:', error);
    return null;
  }
  return data;
}

/**
 * Delete a customer and all their custom documents.
 */
export async function deleteCustomer(slug) {
  if (!supabase) {
    localStorage.removeItem(`roller-cfg-${slug}`);
    localStorage.removeItem(`roller-docs-${slug}`);
    return;
  }

  const customer = await loadCustomer(slug);
  if (!customer) return;

  await supabase.from('custom_documents').delete().eq('customer_id', customer.id);
  await supabase.from('customers').delete().eq('id', customer.id);
}

// ─── Custom Documents ───

/**
 * Load all custom documents for a customer.
 * Returns an object keyed by template_id: { "impl-hub": { name, url }, ... }
 */
export async function loadCustomDocs(customerId) {
  if (!supabase) {
    // Fallback: localStorage (customerId is the slug in fallback mode)
    const raw = localStorage.getItem(`roller-docs-${customerId}`);
    return raw ? JSON.parse(raw) : {};
  }

  const { data, error } = await supabase
    .from('custom_documents')
    .select('*')
    .eq('customer_id', customerId);

  if (error || !data) return {};

  const map = {};
  data.forEach(doc => {
    map[doc.template_id] = {
      name: doc.document_name,
      url: doc.document_url,
    };
  });
  return map;
}

/**
 * Save (upsert) a custom document override for a template.
 */
export async function saveCustomDoc(customerId, templateId, { name, url }) {
  if (!supabase) {
    const existing = JSON.parse(localStorage.getItem(`roller-docs-${customerId}`) || '{}');
    existing[templateId] = { name, url };
    localStorage.setItem(`roller-docs-${customerId}`, JSON.stringify(existing));
    return;
  }

  const { error } = await supabase
    .from('custom_documents')
    .upsert(
      {
        customer_id: customerId,
        template_id: templateId,
        document_name: name,
        document_url: url,
      },
      { onConflict: 'customer_id,template_id' }
    );

  if (error) console.error('Error saving custom doc:', error);
}

/**
 * Remove a custom document override (revert to generic template).
 */
export async function removeCustomDoc(customerId, templateId) {
  if (!supabase) {
    const existing = JSON.parse(localStorage.getItem(`roller-docs-${customerId}`) || '{}');
    delete existing[templateId];
    localStorage.setItem(`roller-docs-${customerId}`, JSON.stringify(existing));
    return;
  }

  const { error } = await supabase
    .from('custom_documents')
    .delete()
    .eq('customer_id', customerId)
    .eq('template_id', templateId);

  if (error) console.error('Error removing custom doc:', error);
}
