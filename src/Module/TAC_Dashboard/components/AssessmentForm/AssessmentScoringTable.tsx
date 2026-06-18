import React from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";

interface AssessmentScoringTableProps {
  scoringSections: any[];
  selectedOptions: any;
  setSelectedOptions: any;
  languageLevels: any;
  setLanguageLevels: any;
  levels: string[];
  skills: string[];
  levelScoreMap: any;
  finalTotal: number;
}

const AssessmentScoringTable: React.FC<AssessmentScoringTableProps> = ({
  scoringSections, selectedOptions, setSelectedOptions, languageLevels, setLanguageLevels,
  levels, skills, levelScoreMap, finalTotal
}) => {
  return (
    <Box className="border border-gray-200 rounded-xl overflow-hidden mb-10">
      {/* HEADER */}
      <Box className="flex justify-between px-4 py-3 text-[11px] font-bold text-[var(--mui-palette-text-primary)] uppercase">
        <Box className="flex gap-4 w-full">
          <span className="w-8">S.N</span>
          <span className="flex-1">Factor / Criteria</span>
        </Box>
        <Box className="flex gap-10 min-w-[120px] justify-end">
          <span>Score</span>
          <span>Final</span>
        </Box>
      </Box>

      {scoringSections.map((section) => {
        const isLanguagePos = section.id === 4;
        return (
          <React.Fragment key={section.id}>
            {isLanguagePos && (
              <>
                <Box className={`flex justify-between px-4 py-2.5 border-t ${section.bg}`}>
                  <Box className="flex gap-4 w-full">
                    <span className="w-8 text-[var(--mui-palette-primary-dark)]">{section.id}</span>
                    <span className="flex-1 uppercase font-semibold text-[var(--mui-palette-primary-dark)]">
                      LANGUAGE (Abilities: Speak,Read, Write,Listen) - L1 'Poor', L2 'Average', L3 'Good', L4 'Excellent' 
                    </span>
                  </Box>
                  <Box className="flex gap-10 min-w-[120px] justify-end">
                    <span className="text-gray-500 text-[11px]">Max</span>
                    <span className="text-gray-500 font-bold">20</span>
                  </Box>
                </Box>

                <Box className="px-4 py-1.5 bg-gray-50 border-b border-gray-200">
                  <Typography className="pl-8 text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                    2nd Language (English)
                  </Typography>
                </Box>

                {skills.map((skill, i) => (
                  <Box key={`eng-${i}`} className="px-4 py-2 border-b border-gray-100 flex items-center justify-between hover:bg-[var(--mui-palette-primary-darkerOpacity)]">
                    <Typography className="pl-12 text-[13px] w-[200px]">{skill}</Typography>
                    <ToggleButtonGroup
                      exclusive size="small" className="flex-1 justify-end pr-10"
                      value={languageLevels.english[skill]}
                      onChange={(e, newValue) => {
                        setLanguageLevels((prev: any) => ({
                          ...prev,
                          english: { ...prev.english, [skill]: prev.english[skill] === newValue ? null : newValue },
                        }));
                      }}
                    >
                      {levels.map((lvl) => (
                        <ToggleButton key={lvl} value={lvl} className="!text-[11px] !px-2 !py-1 !border !border-gray-200 [&.Mui-selected]:bg-[var(--mui-palette-primary-darkerOpacity)] [&.Mui-selected]:text-[var(--mui-palette-primary-light)]">
                          {lvl}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                    <Typography className="mr-3 text-[13px] w-6 text-center">
                      {levelScoreMap[languageLevels.english[skill]] || 0}
                    </Typography>
                  </Box>
                ))}

                <Box className="px-4 py-1.5 bg-gray-50 border-b border-gray-200">
                  <Typography className="pl-8 text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                    3rd Language (Arabic / German / Japanese)
                  </Typography>
                </Box>

                {skills.map((skill, i) => (
                  <Box key={`oth-${i}`} className="px-4 py-2 border-b border-gray-100 flex items-center justify-between hover:bg-[var(--mui-palette-primary-darkerOpacity)]">
                    <Typography className="pl-12 text-[13px] w-[200px]">{skill}</Typography>
                    <ToggleButtonGroup
                      exclusive size="small" className="flex-1 justify-end pr-10"
                      value={languageLevels.other[skill]}
                      onChange={(e, newValue) => {
                        setLanguageLevels((prev: any) => ({
                          ...prev,
                          other: { ...prev.other, [skill]: newValue },
                        }));
                      }}
                    >
                      {levels.map((lvl) => (
                        <ToggleButton key={lvl} value={lvl} className="!text-[11px] !px-2 !py-1 !border !border-gray-200 [&.Mui-selected]:bg-[var(--mui-palette-primary-darkerOpacity)] [&.Mui-selected]:text-[var(--mui-palette-primary-light)]">
                          {lvl}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                    <Typography className="mr-3 text-[13px] w-6 text-center">
                      {languageLevels.other[skill] ? 1 : 0}
                    </Typography>
                  </Box>
                ))}
              </>
            )}

            <Box className={`flex justify-between px-4 py-2.5 border-t ${section.bg}`}>
              <Box className="flex gap-4 w-full">
                <span className="w-8 text-[var(--mui-palette-primary-dark)]">{section.id}</span>
                <span className="flex-1 uppercase font-semibold text-[var(--mui-palette-primary-dark)]">{section.title}</span>
              </Box>
              <Box className="flex gap-10 min-w-[120px] justify-end">
                <span className="text-gray-500 text-[11px]">Max</span>
                <span className="text-gray-500 font-bold">{section.max}</span>
              </Box>
            </Box>

            {section.options.map((opt: any, i: number) => {
              const isMulti = section.id === 4 || section.id === 10 || section.id === 11;
              const isSelected = isMulti ? selectedOptions[section.id]?.includes(i) : selectedOptions[section.id] === i;

              return (
                <Box
                  key={i}
                  onClick={() => {
                    setSelectedOptions((prev: any) => {
                      if (isMulti) {
                        const prevArr = prev[section.id] || [];
                        return {
                          ...prev,
                          [section.id]: prevArr.includes(i) ? prevArr.filter((val: number) => val !== i) : [...prevArr, i],
                        };
                      } else {
                        return { ...prev, [section.id]: prev[section.id] === i ? null : i };
                      }
                    });
                  }}
                  className={`flex justify-between px-4 py-2 border-t cursor-pointer ${isSelected ? " bg-[var(--mui-palette-primary-darkerOpacity)]  " : "hover:bg-[var(--mui-palette-primary-lighterOpacity)]"}`}
                >
                  <Typography className="text-[13px] pl-12 flex items-center gap-2">
                    {opt.label}
                  </Typography>
                  <Box className="flex items-center gap-12">
                    {isSelected && <i className="material-symbols--check-circle-outline text-blue-500 text-[18px]" />}
                    <Typography className="text-[13px] font-bold">{opt.score}</Typography>
                  </Box>
                </Box>
              );
            })}
          </React.Fragment>
        );
      })}

      <Box className="px-4 py-4 flex justify-end gap-6">
        <Typography className="font-extrabold uppercase text-sm">Grand Total Score:</Typography>
        <Typography className="text-blue-600 font-extrabold text-lg">{finalTotal} / 100</Typography>
      </Box>
    </Box>
  );
};

export default AssessmentScoringTable;