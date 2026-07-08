import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp,
  onSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

// ─── INTERFACES ───
export interface Job { id?: string; title: string; company?: string; type: string; location: string; category: string; description: string; requirements: string; benefits?: string; salary?: string; experience?: string; logo?: string; status?: string; apps?: number; createdAt?: any; }
export interface Candidate { id?: string; name: string; email: string; phone: string; title?: string; position?: string; experience?: string; years?: string; portfolio?: string; linkedin?: string; cvUrl: string; notes?: string; status?: string; createdAt?: any; jobId?: string; jobTitle?: string; userId?: string; fileName?: string; }
export interface CompanyRequest { id?: string; companyName?: string; contactName?: string; email: string; phone: string; industry?: string; employees?: string; requirements?: string; status?: string; jobs?: number; createdAt?: any; company?: string; manager?: string; jobTitle?: string; headcount?: string; description?: string; jdUrl?: string; fileName?: string; userId?: string; }
export interface Message { id?: string; name: string; email: string; phone?: string; subject: string; message: string; status?: string; createdAt?: any; userId?: string; }
export interface Consultation { id?: string; name: string; email: string; phone: string; service: string; message?: string; date?: string; time?: string; meeting?: string; status?: string; createdAt?: any; userId?: string; }

// ─── JOBS ───
export async function getJobs() {
  try {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.error("🔥 [db.ts] Error getting jobs:", error.message);
    throw error;
  }
}

export function subscribeToJobs(callback: (jobs: any[]) => void): Unsubscribe {
  const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    console.error("🔥 [db.ts] Error subscribing to jobs:", error.message);
  });
}

export async function addJob(jobData: Job) {
  try {
    const docRef = await addDoc(collection(db, 'jobs'), {
      ...jobData,
      createdAt: Timestamp.now(),
      status: jobData.status || 'open',
      apps: jobData.apps || 0
    });
    console.log("✅ [db.ts] Job added with ID:", docRef.id);
    return docRef;
  } catch (error: any) {
    console.error("🔥 [db.ts] Error adding job:", error.message);
    throw new Error(`Failed to add job: ${error.message}`);
  }
}

export async function updateJob(id: string, data: Partial<Job>) {
  try {
    const docRef = doc(db, 'jobs', id);
    await updateDoc(docRef, data);
    console.log("✅ [db.ts] Job updated:", id);
  } catch (error: any) {
    console.error("🔥 [db.ts] Error updating job:", error.message);
    throw new Error(`Failed to update job: ${error.message}`);
  }
}

export async function deleteJob(id: string) {
  try {
    const docRef = doc(db, 'jobs', id);
    await deleteDoc(docRef);
    console.log("✅ [db.ts] Job deleted:", id);
  } catch (error: any) {
    console.error("🔥 [db.ts] Error deleting job:", error.message);
    throw new Error(`Failed to delete job: ${error.message}`);
  }
}

// ─── CANDIDATES ───
export async function uploadCV(file: File): Promise<string> {
  try {
    const fileRef = ref(storage, `cvs/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);
    console.log("✅ [db.ts] CV uploaded, URL:", url);
    return url;
  } catch (error: any) {
    console.error("🔥 [db.ts] Error uploading CV:", error.message);
    throw new Error(`Failed to upload CV: ${error.message}`);
  }
}

export async function getCandidates() {
  try {
    const q = query(collection(db, 'candidates'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.error("🔥 [db.ts] Error getting candidates:", error.message);
    throw error;
  }
}

export function subscribeToCandidates(callback: (candidates: any[]) => void): Unsubscribe {
  const q = query(collection(db, 'candidates'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => console.error("🔥 [db.ts] Error subscribing to candidates:", error.message));
}

export async function addCandidate(data: Candidate) {
  try {
    const docRef = await addDoc(collection(db, 'candidates'), {
      ...data,
      status: 'pending',
      createdAt: Timestamp.now()
    });
    console.log("✅ [db.ts] Candidate added:", docRef.id);
    return docRef;
  } catch (error: any) {
    console.error("🔥 [db.ts] Error adding candidate:", error.message);
    throw new Error(`Failed to add candidate: ${error.message}`);
  }
}

export async function updateCandidateStatus(id: string, status: string, feedback?: string) {
  try {
    const updateData: any = { status };
    if (feedback !== undefined) {
      updateData.feedback = feedback;
    }
    await updateDoc(doc(db, 'candidates', id), updateData);
    console.log("✅ [db.ts] Candidate status updated:", id);
  } catch (error: any) {
    console.error("🔥 [db.ts] Error updating candidate status:", error.message);
    throw new Error(`Failed to update candidate status: ${error.message}`);
  }
}

// ─── COMPANIES ───
export async function getCompanies() {
  try {
    const q = query(collection(db, 'companies'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.error("🔥 [db.ts] Error getting companies:", error.message);
    throw error;
  }
}

export function subscribeToCompanies(callback: (companies: any[]) => void): Unsubscribe {
  const q = query(collection(db, 'companies'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => console.error("🔥 [db.ts] Error subscribing to companies:", error.message));
}

export async function addCompanyRequest(data: CompanyRequest) {
  try {
    const docRef = await addDoc(collection(db, 'companies'), {
      ...data,
      status: 'active',
      jobs: 0,
      createdAt: Timestamp.now()
    });
    console.log("✅ [db.ts] Company request added:", docRef.id);
    return docRef;
  } catch (error: any) {
    console.error("🔥 [db.ts] Error adding company request:", error.message);
    throw new Error(`Failed to add company request: ${error.message}`);
  }
}

export async function updateCompanyRequestStatus(id: string, status: string) {
  try {
    await updateDoc(doc(db, 'companies', id), { status });
    console.log("✅ [db.ts] Company request status updated:", id);
  } catch (error: any) {
    console.error("🔥 [db.ts] Error updating company request status:", error.message);
    throw new Error(`Failed to update company request status: ${error.message}`);
  }
}

// ─── MESSAGES ───
export async function getMessages() {
  try {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.error("🔥 [db.ts] Error getting messages:", error.message);
    throw error;
  }
}

export function subscribeToMessages(callback: (messages: any[]) => void): Unsubscribe {
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => console.error("🔥 [db.ts] Error subscribing to messages:", error.message));
}

export async function addMessage(data: Message) {
  try {
    const docRef = await addDoc(collection(db, 'messages'), {
      ...data,
      status: 'new',
      createdAt: Timestamp.now()
    });
    console.log("✅ [db.ts] Message added:", docRef.id);
    return docRef;
  } catch (error: any) {
    console.error("🔥 [db.ts] Error adding message:", error.message);
    throw new Error(`Failed to add message: ${error.message}`);
  }
}

export async function deleteMessage(id: string) {
  try {
    await deleteDoc(doc(db, 'messages', id));
    console.log("✅ [db.ts] Message deleted:", id);
  } catch (error: any) {
    console.error("🔥 [db.ts] Error deleting message:", error.message);
    throw new Error(`Failed to delete message: ${error.message}`);
  }
}

// ─── CONSULTATIONS ───
export async function getConsultations() {
  try {
    const q = query(collection(db, 'consultations'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.error("🔥 [db.ts] Error getting consultations:", error.message);
    throw error;
  }
}

export function subscribeToConsultations(callback: (consultations: any[]) => void): Unsubscribe {
  const q = query(collection(db, 'consultations'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => console.error("🔥 [db.ts] Error subscribing to consultations:", error.message));
}

export async function addConsultation(data: Consultation) {
  try {
    const docRef = await addDoc(collection(db, 'consultations'), {
      ...data,
      status: 'pending',
      createdAt: Timestamp.now()
    });
    console.log("✅ [db.ts] Consultation added:", docRef.id);
    return docRef;
  } catch (error: any) {
    console.error("🔥 [db.ts] Error adding consultation:", error.message);
    throw new Error(`Failed to add consultation: ${error.message}`);
  }
}

export async function updateConsultationStatus(id: string, status: string) {
  try {
    await updateDoc(doc(db, 'consultations', id), { status });
    console.log("✅ [db.ts] Consultation status updated:", id);
  } catch (error: any) {
    console.error("🔥 [db.ts] Error updating consultation status:", error.message);
    throw new Error(`Failed to update consultation status: ${error.message}`);
  }
}

// ─── CMS (Dynamic Content) ───
export function subscribeToCMS(collectionName: string, callback: (data: any[]) => void): Unsubscribe {
  const q = query(collection(db, collectionName), orderBy('order', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => console.error(`🔥 [db.ts] Error subscribing to CMS [${collectionName}]:`, error.message));
}

export async function addCMSItem(collectionName: string, data: any) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now()
    });
    console.log(`✅ [db.ts] CMS item added to ${collectionName}:`, docRef.id);
    return docRef;
  } catch (error: any) {
    console.error(`🔥 [db.ts] Error adding CMS item to ${collectionName}:`, error.message);
    throw new Error(`Failed to add to ${collectionName}: ${error.message}`);
  }
}

export async function updateCMSItem(collectionName: string, id: string, data: any) {
  try {
    await updateDoc(doc(db, collectionName, id), data);
    console.log(`✅ [db.ts] CMS item updated in ${collectionName}:`, id);
  } catch (error: any) {
    console.error(`🔥 [db.ts] Error updating CMS item in ${collectionName}:`, error.message);
    throw new Error(`Failed to update ${collectionName}: ${error.message}`);
  }
}

export async function deleteCMSItem(collectionName: string, id: string) {
  try {
    await deleteDoc(doc(db, collectionName, id));
    console.log(`✅ [db.ts] CMS item deleted in ${collectionName}:`, id);
  } catch (error: any) {
    console.error(`🔥 [db.ts] Error deleting CMS item in ${collectionName}:`, error.message);
    throw new Error(`Failed to delete ${collectionName}: ${error.message}`);
  }
}

export async function getUserCandidates(userId: string) {
  const q = query(collection(db, 'candidates'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
}

export async function getUserMessages(userId: string) {
  const q = query(collection(db, 'messages'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
}

export async function getUserConsultations(userId: string) {
  const q = query(collection(db, 'consultations'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
}

export async function getUserCompanyRequests(userId: string) {
  const q = query(collection(db, 'companies'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
}

import { writeBatch } from 'firebase/firestore';

export async function seedCMS() {
  const batch = writeBatch(db);

  // 1. STATS
  const stats = [
    { value: 500, suffix: "+", label: "Happy Clients", iconName: "Users", order: 1 },
    { value: 1000, suffix: "+", label: "CV Reviews", iconName: "FileText", order: 2 },
    { value: 150, suffix: "+", label: "Successful Recruitments", iconName: "Briefcase", order: 3 },
    { value: 98, suffix: "%", label: "Client Satisfaction", iconName: "Star", order: 4 },
  ];
  stats.forEach(item => batch.set(doc(collection(db, 'stats')), { ...item, createdAt: Timestamp.now() }));

  // 2. SERVICES_INDIVIDUALS
  const servicesIndiv = [
    { iconName: "FileText", title: "Professional CV Writing", desc: "Craft a standout CV that gets noticed by top employers and passes ATS screening systems.", order: 1 },
    { iconName: "Eye", title: "CV Review", desc: "Get expert feedback and actionable improvements for your existing CV from our HR specialists.", order: 2 },
    { iconName: "Linkedin", title: "LinkedIn Optimization", desc: "Build a compelling LinkedIn profile that attracts recruiters and showcases your true value.", order: 3 },
    { iconName: "Video", title: "Mock Interview", desc: "Practice with real-world interview scenarios and receive constructive feedback from experts.", order: 4 },
    { iconName: "Target", title: "Career Coaching", desc: "Personalized one-on-one guidance to help you define goals and navigate your career path.", order: 5 },
    { iconName: "BookOpen", title: "Interview Preparation", desc: "Comprehensive preparation packages covering industry-specific questions and best practices.", order: 6 },
  ];
  servicesIndiv.forEach(item => batch.set(doc(collection(db, 'services_individuals')), { ...item, createdAt: Timestamp.now() }));

  // 3. SERVICES_COMPANIES
  const servicesComp = [
    { iconName: "Users", title: "Recruitment", desc: "End-to-end hiring solutions that find, screen, and deliver top candidates for your team.", order: 1 },
    { iconName: "FileText", title: "CV Screening", desc: "Expert pre-screening of applicants to shortlist only the most qualified candidates for you.", order: 2 },
    { iconName: "MessageSquare", title: "Initial Interviews", desc: "We handle first-round interviews, saving your team valuable time and resources.", order: 3 },
    { iconName: "Shield", title: "HR Consultation", desc: "Strategic HR advisory services to optimize your people operations and policies.", order: 4 },
    { iconName: "TrendingUp", title: "Talent Acquisition", desc: "Build your dream team with strategic talent pipelines and employer branding support.", order: 5 },
    { iconName: "Briefcase", title: "Job Posting", desc: "Reach thousands of qualified candidates through our extensive network and platforms.", order: 6 },
  ];
  servicesComp.forEach(item => batch.set(doc(collection(db, 'services_companies')), { ...item, createdAt: Timestamp.now() }));

  // 4. TESTIMONIALS
  const testimonials = [
    { name: "Ahmed Hassan", role: "Software Engineer at Microsoft", rating: 5, text: "Career Bridge transformed my job search. Their CV writing and interview prep helped me land my dream job at Microsoft within just 3 months.", order: 1 },
    { name: "Sara Mohamed", role: "HR Manager at Vodafone", rating: 5, text: "The recruitment service is exceptional. They delivered 10 highly qualified candidates within 2 weeks. This is now our go-to hiring partner.", order: 2 },
    { name: "Omar Khalil", role: "Marketing Director", rating: 5, text: "The career coaching sessions gave me incredible clarity and direction. I received a promotion within 6 months of working with Career Bridge.", order: 3 },
    { name: "Nour Youssef", role: "UX Designer at Noon", rating: 5, text: "My LinkedIn profile views jumped 400% after their optimization service. I get headhunted regularly now. Best investment in my career.", order: 4 },
  ];
  testimonials.forEach(item => batch.set(doc(collection(db, 'testimonials')), { ...item, createdAt: Timestamp.now() }));

  // 5. FAQS
  const faqs = [
    { q: "How long does the CV writing process take?", a: "Our professional CV writing service typically takes 3–5 business days. We begin with a discovery call to understand your background, goals, and target roles, then deliver a tailored, ATS-optimized CV.", order: 1 },
    { q: "What formats will my CV be delivered in?", a: "We deliver your finalized CV in both Microsoft Word (.docx) and PDF formats, ensuring compatibility with all application platforms and ATS systems.", order: 2 },
    { q: "Do you offer revision rounds?", a: "Yes, all our services include up to 3 rounds of revisions to ensure you are completely satisfied with the final result. We work until you're proud of your CV.", order: 3 },
    { q: "How do you match candidates with companies?", a: "We use a combination of skills assessment, experience matching, and cultural fit analysis. Our experienced team manually reviews every profile to ensure the highest quality matches.", order: 4 },
    { q: "Is uploading my CV free?", a: "Yes, submitting your CV through our platform is completely free. Our team will review your profile and reach out when matching opportunities arise.", order: 5 },
    { q: "How long does the recruitment process typically take?", a: "Depending on the seniority and complexity of the role, our recruitment process typically takes 2–4 weeks from job briefing to offer stage.", order: 6 },
  ];
  faqs.forEach(item => batch.set(doc(collection(db, 'faqs')), { ...item, createdAt: Timestamp.now() }));

  // 6. STEPS
  const steps = [
    { num: "01", title: "Create Your Profile", desc: "Sign up and build your professional profile with skills, experience, and career goals.", order: 1 },
    { num: "02", title: "Upload Your CV", desc: "Submit your CV for expert review and enhancement by our HR professionals.", order: 2 },
    { num: "03", title: "Profile Review", desc: "Our team reviews your profile and matches it with the best opportunities available.", order: 3 },
    { num: "04", title: "Interview Preparation", desc: "We prepare you with mock interviews and tips tailored to your target role.", order: 4 },
    { num: "05", title: "Get Matched", desc: "We connect you with top companies actively looking for your profile.", order: 5 },
    { num: "06", title: "Get Hired", desc: "Accept your offer and start your new chapter with full confidence.", order: 6 },
  ];
  steps.forEach(item => batch.set(doc(collection(db, 'steps')), { ...item, createdAt: Timestamp.now() }));

  await batch.commit();
}
