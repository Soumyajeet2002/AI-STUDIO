import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Sparkles,
    Zap,
    Apple,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import "./LoginPage.css";

interface LocationState {
    from?: {
        pathname?: string;
        search?: string;
        hash?: string;
    };
}

const testimonials = [
    {
        name: "David S.",
        role: "Founder & CEO",
        quote: "Built for better thinking.",
        avatar: "DS",
    },
    {
        name: "Mira K.",
        role: "Product Manager",
        quote: "My work, finally connected.",
        avatar: "MK",
    },
    {
        name: "Alex R.",
        role: "Independent Creator",
        quote: "More focus. Less busywork.",
        avatar: "AR",
    },
];

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { from } = (location.state as LocationState | null) ?? {};
    const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [validationError, setValidationError] = useState("");

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearError();
        setValidationError("");

        const normalizedEmail = email.trim();

        if (!normalizedEmail || !password) {
            setValidationError("Enter your email and password to continue.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setValidationError("Enter a valid email address.");
            return;
        }

        try {
            await login({
                email: normalizedEmail,
                password,
            });

            const destination = from?.pathname?.startsWith("/")
                ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
                : "/";

            navigate(destination, { replace: true });
        } catch {
            // The authentication store provides the API error for the form.
        }
    };

    const clearFormErrors = () => {
        if (error) clearError();
        if (validationError) setValidationError("");
    };
    const handleSocialLogin = (provider: "google" | "apple" | "facebook") => {
        // OAuth integration will be connected to the backend here.
        // Do not mark the user as authenticated until OAuth succeeds.
        navigate("/auth/social-login", {
            state: {
                provider,
                returnTo: from?.pathname ?? "/",
            },
        });
    };

    return (
        <main className="auth-page">
            <div className="auth-page__ambient auth-page__ambient--left" />
            <div className="auth-page__ambient auth-page__ambient--right" />

            <section className="auth-layout" aria-label="LifeOS authentication">
                <div className="auth-showcase">
                    <Link to="/" className="auth-back-link">
                        <ArrowLeft size={17} strokeWidth={1.7} />
                        <span>Back to LifeOS</span>
                    </Link>

                    <div className="auth-brand">
                        <div className="auth-brand__eyebrow">
                            <Sparkles size={14} />
                            <span>YOUR PERSONAL AI WORKSPACE</span>
                        </div>

                        <h1 className="auth-brand__title">
                            Your <span>AI</span>
                            <br />
                            <span className="auth-brand__title-bottom">Assistant.</span>
                        </h1>

                        <p className="auth-brand__description">
                            One intelligent space for your ideas, projects, knowledge,
                            and everyday work.
                        </p>
                    </div>

                    <div className="auth-hero">
                        <div className="auth-hero__orb auth-hero__orb--outer" />
                        <div className="auth-hero__orb auth-hero__orb--middle" />
                        <div className="auth-hero__orb auth-hero__orb--inner">
                            <Sparkles size={48} strokeWidth={1.1} />
                        </div>

                        <div className="auth-hero__orbit auth-hero__orbit--one" />
                        <div className="auth-hero__orbit auth-hero__orbit--two" />

                        <div className="auth-stat auth-stat--top">
                            <span className="auth-stat__icon">
                                <Zap size={15} />
                            </span>
                            <div>
                                <strong>One intelligent space</strong>
                                <span>Your work, connected</span>
                            </div>
                        </div>

                        <div className="auth-stat auth-stat--bottom">
                            <span className="auth-stat__icon">
                                <ShieldCheck size={15} />
                            </span>
                            <div>
                                <strong>Built around you</strong>
                                <span>Ideas into action</span>
                            </div>
                        </div>
                    </div>

                    <div className="auth-testimonials">
                        {testimonials.map((testimonial, index) => (
                            <article
                                className={`auth-testimonial ${index === 2 ? "auth-testimonial--last" : ""
                                    }`}
                                key={testimonial.name}
                            >
                                <div className="auth-testimonial__header">
                                    <div
                                        className={`auth-testimonial__avatar auth-testimonial__avatar--${index}`}
                                        aria-hidden="true"
                                    >
                                        {testimonial.avatar}
                                    </div>

                                    <div className="auth-testimonial__identity">
                                        <strong>{testimonial.name}</strong>
                                        <span>{testimonial.role}</span>
                                    </div>

                                    <ArrowUpRight
                                        className="auth-testimonial__arrow"
                                        size={15}
                                    />
                                </div>

                                <p>{testimonial.quote}</p>
                            </article>
                        ))}
                    </div>

                    <div className="auth-showcase__footer">
                        <span>THINK CLEARER.</span>
                        <span>BUILD BETTER.</span>
                        <span>LIVE SMARTER.</span>
                    </div>
                </div>

                <div className="auth-form-panel">
                    {/* <div className="auth-form-panel__top">
                        <div className="auth-mobile-brand">
                            <span className="auth-mobile-brand__icon">
                                <Sparkles size={19} />
                            </span>
                            <span>LifeOS</span>
                        </div>

                        <span className="auth-step-indicator">
                            <span />
                            SECURE SIGN IN
                        </span>
                    </div> */}

                    <div className="auth-form-heading">
                        <span className="auth-form-heading__eyebrow">
                            WELCOME BACK
                        </span>
                        <h2>Pick up where<br />you left off.</h2>
                        <p>Your next great idea starts here.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <div className="auth-field">
                            <label htmlFor="login-email">Email address</label>

                            <div className="auth-input-wrap">
                                <Mail size={18} className="auth-input-icon" />

                                <input
                                    id="login-email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        clearFormErrors();
                                    }}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <div className="auth-field__label-row">
                                <label htmlFor="login-password">Password</label>
                                <button
                                    type="button"
                                    className="auth-text-button"
                                    onClick={() =>
                                        navigate("/forgot-password", {
                                            state: { email: email.trim() },
                                        })
                                    }
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <div className="auth-input-wrap">
                                <LockKeyhole size={18} className="auth-input-icon" />

                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(event.target.value);
                                        clearFormErrors();
                                    }}
                                    disabled={isLoading}
                                    required
                                />

                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() => setShowPassword((current) => !current)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        {(validationError || error) && (
                            <div className="auth-error" role="alert">
                                {validationError || error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={isLoading}
                        >
                            <span>{isLoading ? "Signing you in..." : "Sign in"}</span>
                            {isLoading ? (
                                <span className="auth-submit__spinner" />
                            ) : (
                                <ArrowRight size={19} />
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span />
                        <span>OR CONTINUE WITH</span>
                        <span />
                    </div>

                    <div className="auth-social">
                        <button
                            type="button"
                            className="auth-social__button"
                            onClick={() => handleSocialLogin("google")}
                            disabled={isLoading}
                        >
                            <svg
                                className="auth-social__google-icon"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                            >
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 3.01 13.22l7.98 6.19C12.88 13.72 18.01 9.5 24 9.5Z" />
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.62 5.91c4.45-4.11 7.15-10.16 7.15-17.56Z" />
                                <path fill="#FBBC05" d="M10.99 28.59A14.4 14.4 0 0 1 10.23 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 3.01 10.78l7.98-6.19Z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.89l-7.62-5.91c-2.12 1.42-4.84 2.26-8.29 2.26-5.99 0-11.12-4.22-13.01-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
                            </svg>
                            <span>Google</span>
                        </button>

                        <button
                            type="button"
                            className="auth-social__button"
                            onClick={() => handleSocialLogin("apple")}
                            disabled={isLoading}
                        >
                            <Apple size={21} fill="currentColor" strokeWidth={1.4} />
                            <span>Apple</span>
                        </button>

                        <button
                            type="button"
                            className="auth-social__button"
                            onClick={() => handleSocialLogin("facebook")}
                            disabled={isLoading}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    fill="#1877F2"
                                    d="M24 12a12 12 0 1 0-13.875 11.854v-8.385H7.078V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.313 0 2.686.235 2.686.235v2.953h-1.513c-1.49 0-1.956.925-1.956 1.874V12h3.328l-.532 3.469h-2.796v8.385A12.002 12.002 0 0 0 24 12Z"
                                />
                            </svg>
                            <span>Facebook</span>
                        </button>
                    </div>




                    {/* <div className="auth-divider">
                        <span />
                        <span>YOUR WORKSPACE AWAITS</span>
                        <span />
                    </div> */}

                    {/* <div className="auth-benefits">
                        <div>
                            <span className="auth-benefits__icon">
                                <Sparkles size={16} />
                            </span>
                            <span>
                                <strong>Your AI, your way</strong>
                                <small>Tools and agents in one place</small>
                            </span>
                        </div>

                        <div>
                            <span className="auth-benefits__icon">
                                <ShieldCheck size={16} />
                            </span>
                            <span>
                                <strong>Your space, your control</strong>
                                <small>Sign in to access your workspace</small>
                            </span>
                        </div>
                    </div> */}

                    <div className="auth-form-footer">
                        <p>
                            New to LifeOS?{" "}
                            <Link to="/register" className="auth-register-link">
                                Create an account <ArrowRight size={14} />
                            </Link>
                        </p>

                    </div>
                </div>
            </section>
        </main>
    );
}