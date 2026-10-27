import React from 'react';
import {
  getMuscleHighlight,
  getMuscleRegionFill,
  MuscleRegion,
} from '../constants/muscleGroupMap.ts';

interface MuscleIllustrationProps {
  exerciseName: string;
  muscleGroup?: string;
  className?: string;
  compact?: boolean;
}

export const MuscleIllustration: React.FC<MuscleIllustrationProps> = ({
  exerciseName,
  muscleGroup,
  className = '',
  compact = false,
}) => {
  const highlight = getMuscleHighlight(exerciseName, muscleGroup);
  const fill = (region: MuscleRegion) => getMuscleRegionFill(region, highlight);
  const viewLabel = highlight.view === 'front' ? 'frente' : 'costas';
  const width = compact ? 60 : 200;
  const height = compact ? 80 : 300;

  return (
    <svg
      viewBox="0 0 200 300"
      width={width}
      height={height}
      role="img"
      aria-labelledby="muscle-illustration-title"
      className={'block h-auto max-w-full ' + className}
      style={{ width: compact ? 60 : 'min(100%, 200px)', height: 'auto', maxHeight: compact ? 80 : 300 }}
    >
      <title id="muscle-illustration-title">
        Ilustração da {viewLabel} do corpo com destaque em {highlight.label}
      </title>

      {highlight.view === 'front' ? (
        <g aria-label="Vista frontal do corpo">
          <circle cx="100" cy="22" r="16" fill="#374151" />
          <path d="M92 37h16v15H92z" fill="#374151" />
          <path d="M78 51Q100 43 122 51l12 13-7 70q-1 13-14 17H87q-13-4-14-17l-7-70z" fill="#374151" />
          <path d="M67 58Q55 62 50 76l-16 48q-3 9 5 12 7 2 11-7l20-38zM133 58q12 4 17 18l16 48q3 9-5 12-7 2-11-7l-20-38z" fill="#374151" />
          <path d="M83 146q17 8 34 0l7 38-9 33H85l-9-33z" fill="#374151" />
          <path d="M84 211h22l-2 57q-1 9-9 9t-9-9zM106 211h10l-2 57q-1 9-9 9t-9-9z" fill="#374151" />
          <path d="M86 270h10q5 5 4 13H78q0-9 8-13zM108 270h10q8 4 8 13h-21q-1-8 3-13z" fill="#374151" />

          <path id="muscle-deltoid-front" d="M69 61q9-8 18 1l-3 20q-10 3-18-5z" fill={fill('deltoid-front')} />
          <path id="muscle-deltoid-side" d="M131 61q-9-8-18 1l3 20q10 3 18-5z" fill={fill('deltoid-side')} />
          <path id="muscle-peito" d="M79 72q10-9 20-4v25q-13 5-22-3zM101 68q10-5 20 4l2 18q-9 8-22 3z" fill={fill('peito')} />
          <path id="muscle-biceps" d="M54 86q8-2 12 5l-8 25q-5 5-10-1zM146 86q-8-2-12 5l8 25q5 5 10-1z" fill={fill('biceps')} />
          <path id="muscle-triceps" d="M48 116q6 2 11 0l-5 16q-6 5-12 0zM152 116q-6 2-11 0l5 16q6 5 12 0z" fill={fill('triceps')} />
          <path id="muscle-abdomen" d="M92 99h7v9h-7zM101 99h7v9h-7zM92 111h7v9h-7zM101 111h7v9h-7zM92 123h7v9h-7zM101 123h7v9h-7z" fill={fill('abdomen')} />
          <path id="muscle-quadriceps" d="M82 151q8 4 16 1l-2 48q-5 7-12 2l-8-31zM102 152q8 3 16-1l6 20-8 31q-7 5-12-2z" fill={fill('quadriceps')} />
          <path id="muscle-panturrilha" d="M86 218h10l-2 35q-5 6-10 0zM105 218h10l2 35q-5 6-10 0z" fill={fill('panturrilha')} />
        </g>
      ) : (
        <g aria-label="Vista posterior do corpo">
          <circle cx="100" cy="22" r="16" fill="#374151" />
          <path d="M92 37h16v15H92z" fill="#374151" />
          <path d="M78 51Q100 43 122 51l12 13-7 70q-1 13-14 17H87q-13-4-14-17l-7-70z" fill="#374151" />
          <path d="M67 58Q55 62 50 76l-16 48q-3 9 5 12 7 2 11-7l20-38zM133 58q12 4 17 18l16 48q3 9-5 12-7 2-11-7l-20-38z" fill="#374151" />
          <path d="M83 146q17 8 34 0l7 38-9 33H85l-9-33z" fill="#374151" />
          <path d="M84 211h22l-2 57q-1 9-9 9t-9-9zM106 211h10l-2 57q-1 9-9 9t-9-9z" fill="#374151" />
          <path d="M86 270h10q5 5 4 13H78q0-9 8-13zM108 270h10q8 4 8 13h-21q-1-8 3-13z" fill="#374151" />

          <path id="muscle-trapezio" d="M89 53h22l13 19-19 18-19-18z" fill={fill('trapezio')} />
          <path id="muscle-deltoid-side" d="M69 61q9-8 18 1l-3 20q-10 3-18-5zM131 61q-9-8-18 1l3 20q10 3 18-5z" fill={fill('deltoid-side')} />
          <path id="muscle-lat" d="M81 79l20 12 18-12 8 42q-5 13-27 16-22-3-27-16z" fill={fill('lat')} />
          <path id="muscle-triceps" d="M48 85q8-2 13 5l-5 28q-6 3-11-1zM152 85q-8-2-13 5l5 28q6 3 11-1z" fill={fill('triceps')} />
          <path id="muscle-gluteo" d="M82 143q9 2 18 0v29q-10 8-19-2zM101 143q9 2 18 0l1 27q-9 10-19 2z" fill={fill('gluteo')} />
          <path id="muscle-posterior-coxa" d="M82 173q9 5 18 0l-2 34q-5 9-12 2l-7-20zM102 173q9 5 18 0l3 16-7 20q-7 7-12-2z" fill={fill('posterior-coxa')} />
          <path id="muscle-adutores" d="M97 174h6l2 30-5 5-5-5z" fill={fill('adutores')} />
          <path id="muscle-panturrilha" d="M85 213q6 2 12 0l-2 39q-6 5-11 0zM103 213q6 2 12 0l1 39q-5 5-11 0z" fill={fill('panturrilha')} />
        </g>
      )}
    </svg>
  );
};
