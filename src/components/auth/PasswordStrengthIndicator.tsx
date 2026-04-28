import { analyzePasswordStrength } from '@/lib/passwordSecurity';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

const strengthColors: Record<string, string> = {
  'Weak': 'bg-red-500',
  'Fair': 'bg-orange-500',
  'Good': 'bg-yellow-500',
  'Strong': 'bg-lime-500',
  'Very Strong': 'bg-green-500',
};

const strengthTextColors: Record<string, string> = {
  'Weak': 'text-red-600',
  'Fair': 'text-orange-600',
  'Good': 'text-yellow-600',
  'Strong': 'text-lime-600',
  'Very Strong': 'text-green-600',
};

const strengthBgColors: Record<string, string> = {
  'Weak': 'bg-red-50',
  'Fair': 'bg-orange-50',
  'Good': 'bg-yellow-50',
  'Strong': 'bg-lime-50',
  'Very Strong': 'bg-green-50',
};

export function PasswordStrengthIndicator({ password, showRequirements = true }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const analysis = analyzePasswordStrength(password);

  return (
    <div className="space-y-3">
      {/* Strength Meter */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-600">Password Strength</span>
          <span className={`text-xs font-semibold ${strengthTextColors[analysis.label]}`}>
            {analysis.label}
          </span>
        </div>

        {/* Progress bar with segments */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strengthColors[analysis.label]}`}
            style={{ width: `${analysis.percentage}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className={`text-xs space-y-1.5 p-3 rounded-lg ${strengthBgColors[analysis.label]}`}>
          {/* Positive feedback */}
          {analysis.feedback.length > 0 && (
            <div className="space-y-1">
              {analysis.feedback.map((item, idx) => (
                <div key={`feedback-${idx}`} className={`flex items-center gap-2 ${strengthTextColors[analysis.label]}`}>
                  <span className="text-sm">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}

          {/* Issues/Requirements */}
          {analysis.issues.length > 0 && (
            <div className="space-y-1 mt-2">
              {analysis.issues.map((issue, idx) => (
                <div key={`issue-${idx}`} className="flex items-center gap-2 text-red-600">
                  <span className="text-sm">•</span>
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          )}

          {/* Minimum requirements met badge */}
          {analysis.meetsMinimum && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-current border-opacity-20 text-green-700 font-medium">
              <span className="text-sm">✓</span>
              <span>Meets minimum security requirements</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Password Requirements Reference Component
 * Shows what a strong password should contain
 */
export function PasswordRequirements() {
  return (
    <div className="text-xs space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <p className="font-semibold text-blue-900 mb-2">Strong Password Requirements:</p>
      <ul className="space-y-1.5 text-blue-800">
        <li className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full" />
          Minimum 8 characters (at least 6 required)
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full" />
          At least one uppercase letter (A-Z)
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full" />
          At least one lowercase letter (a-z)
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full" />
          At least one number (0-9)
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full" />
          Special characters recommended (!@#$%^&*)
        </li>
      </ul>
    </div>
  );
}
