import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  IconButton,
  Alert,
  AlertIcon,
  Text,
  HStack,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, DownloadIcon } from "@chakra-ui/icons";

const COMPETENCIES = [
  "Problem Solving",
  "Creative/Operational Thinking",
  "Initiative",
  "Communication",
  "Influence",
  "Autonomy",
  "Commercial Awareness",
  "Collaboration & Team Work",
];
const LEVELS = ["Follow", "Assist", "Apply", "Ensure", "Influence"];

// helper: "Problem Solving" → "problemSolving"
const camelCaseKey = (s) =>
  s
    .replace(/&/g, "")
    .split(/\s+/)
    .map((w, i) =>
      i === 0 ? w[0].toLowerCase() + w.slice(1) : w[0].toUpperCase() + w.slice(1)
    )
    .join("");

const emptyPosition = () => {
  const base = { title: "", description: "" };
  COMPETENCIES.forEach((c) => {
    base[camelCaseKey(c)] = "";
  });
  return base;
};

const CompetencyFramework = () => {
  const [framework, setFramework] = useState({
    department: "",
    positions: [emptyPosition()],
  });
  const [departments, setDepartments] = useState([]);
  const [deptQuery, setDeptQuery] = useState("");
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const deptRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // fetch departments
  useEffect(() => {
    fetch("/api/departments/list")
      .then((r) => r.json())
      .then((data) => setDepartments(data.departments))
      .catch(() => setError("Failed to load departments."));
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (deptRef.current && !deptRef.current.contains(e.target)) {
        setShowDeptDropdown(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const updatePosition = (idx, key, value) => {
    setFramework((f) => {
      const ps = [...f.positions];
      ps[idx] = { ...ps[idx], [key]: value };
      return { ...f, positions: ps };
    });
  };

  const addPosition = () =>
    setFramework((f) => ({
      ...f,
      positions: [...f.positions, emptyPosition()],
    }));
  const removePosition = (idx) =>
    setFramework((f) => ({
      ...f,
      positions: f.positions.filter((_, i) => i !== idx),
    }));

  const generateDescriptions = async () => {
    setError("");
    if (!framework.department) {
      setError("Please select a department.");
      return;
    }
    for (let p of framework.positions) {
      if (!p.title || COMPETENCIES.some((c) => !p[camelCaseKey(c)])) {
        setError("Please fill every Title and select all Levels.");
        return;
      }
    }
    setLoading(true);
    try {
      const res = await fetch("/api/generate-competencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(framework),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error("API error");
      }
      // data.competencyDescriptions: [{ title, description }, …]
      setFramework((f) => ({
        ...f,
        positions: f.positions.map((p) => {
          const found = data.competencyDescriptions.find((d) => d.title === p.title);
          return found ? { ...p, description: found.description } : p;
        }),
      }));
      setSuccess("Descriptions generated!");
    } catch {
      setError("Failed to generate descriptions.");
    } finally {
      setLoading(false);
    }
  };

  const saveFramework = async () => {
    setError(""); setSuccess("");
    setLoading(true);
    try {
      // build SaveCompetencyRequest payload:
      const jobTitles = framework.positions.map((p) => ({
        job_title: p.title,
        job_levels: COMPETENCIES.map((c) => p[camelCaseKey(c)]),
        competencies: COMPETENCIES.map((c) => ({
          name: c,
          descriptions: {}, // you can fill from key or generated if needed
        })),
      }));
      const res = await fetch("/api/save-competencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department: framework.department, jobTitles }),
      });
      const d = await res.json();
      if (!d.success) throw new Error();
      setSuccess("Framework saved!");
    } catch {
      setError("Failed to save framework.");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const header = [
      "Position",
      ...COMPETENCIES,
      "Description",
    ];
    const rows = framework.positions.map((p) => [
      `"${p.title}"`,
      ...COMPETENCIES.map((c) => `"${p[camelCaseKey(c)]}"`),
      `"${p.description}"`,
    ]);
    const csv =
      [header.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "competency_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box maxW="1200px" mx="auto" p="6">
      <Heading mb="4">Competency Framework</Heading>

      {/* Department Autocomplete */}
      <Box ref={deptRef} mb="6" position="relative">
        <Input
          placeholder="Select Department"
          value={deptQuery}
          onFocus={() => setShowDeptDropdown(true)}
          onChange={(e) => {
            setDeptQuery(e.target.value);
            setShowDeptDropdown(true);
          }}
        />
        {showDeptDropdown && (
          <Box
            position="absolute" bg="white" w="full" border="1px solid"
            borderColor="gray.200" maxH="200px" overflowY="auto"
          >
            {departments
              .filter((d) =>
                (d.department || "")
                  .toLowerCase()
                  .includes(deptQuery.toLowerCase())
              )
              .map((d) => (
                <Box
                  key={d.id}
                  p="2"
                  cursor="pointer"
                  _hover={{ bg: "gray.100" }}
                  onClick={() => {
                    setFramework((f) => ({ ...f, department: d.id }));
                    setDeptQuery(d.department);
                    setShowDeptDropdown(false);
                  }}
                >
                  {d.department}
                </Box>
              ))}
          </Box>
        )}
      </Box>

      {/* Positions × Competencies Grid */}
      <Table size="sm" variant="simple" mb="4">
        <Thead>
          <Tr>
            <Th>Position</Th>
            {COMPETENCIES.map((c) => (
              <Th key={c} fontSize="sm">
                {c}
              </Th>
            ))}
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {framework.positions.map((pos, i) => (
            <Tr key={i}>
              <Td p="1">
                <Input
                  size="sm"
                  placeholder="Title"
                  value={pos.title}
                  onChange={(e) =>
                    updatePosition(i, "title", e.target.value)
                  }
                />
              </Td>
              {COMPETENCIES.map((c) => {
                const key = camelCaseKey(c);
                return (
                  <Td key={c} p="1">
                    <Select
                      size="sm"
                      placeholder="Level"
                      value={pos[key]}
                      onChange={(e) =>
                        updatePosition(i, key, e.target.value)
                      }
                    >
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </Select>
                  </Td>
                );
              })}
              <Td p="1">
                <IconButton
                  size="sm"
                  icon={<DeleteIcon />}
                  aria-label="Remove"
                  onClick={() => removePosition(i)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <HStack mb="6">
        <Button
          leftIcon={<AddIcon />}
          onClick={addPosition}
          size="sm"
        >
          Add Position
        </Button>
      </HStack>

      {/* Actions */}
      <VStack spacing="3" align="start" mb="6">
        <Button
          colorScheme="purple"
          onClick={generateDescriptions}
          isLoading={loading}
        >
          Generate Descriptions
        </Button>
        <Button
          colorScheme="green"
          onClick={saveFramework}
          isLoading={loading}
        >
          Save Framework
        </Button>
        <Button
          leftIcon={<DownloadIcon />}
          variant="outline"
          onClick={downloadCSV}
        >
          Download CSV
        </Button>
      </VStack>

      {error && (
        <Alert status="error" mb="3">
          <AlertIcon />
          {error}
        </Alert>
      )}
      {success && (
        <Alert status="success" mb="3">
          <AlertIcon />
          {success}
        </Alert>
      )}

      {/* Elevator Pitches */}
      {framework.positions.every((p) => p.description) && (
        <VStack align="stretch" spacing="4" mt="6">
          <Heading size="md">Elevator Pitches</Heading>
          {framework.positions.map((p, i) => (
            <Box
              key={i}
              p="3"
              borderWidth="1px"
              borderRadius="md"
              shadow="sm"
            >
              <Text fontWeight="bold">{p.title}</Text>
              <Text mt="2">{p.description}</Text>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default CompetencyFramework;
