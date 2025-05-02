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

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://interviewappbe-production.up.railway.app";

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

// helper to turn "Creative/Operational Thinking" → "creativeOperationalThinking"
const camelCaseKey = (s) => {
  const clean = s.replace(/[^a-zA-Z0-9 ]/g, "");
  return clean
    .split(/\s+/)
    .map((w, i) =>
      i === 0
        ? w[0]?.toLowerCase() + w.slice(1)
        : w[0]?.toUpperCase() + w.slice(1)
    )
    .join("");
};

const emptyPosition = () => {
  const base = {
    title: "",
    // breakdown will hold the three sentences
    breakdown: { Brave: "", Owners: "", Inclusive: "" },
  };
  // initialize level fields
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

  // Fetch departments
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/departments/list`)
      .then((r) => r.json())
      .then((data) => setDepartments(data.departments))
      .catch(() => setError("Failed to load departments."));
  }, []);

  // Close dropdown
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
    // ensure title + all levels filled
    for (let p of framework.positions) {
      if (!p.title || COMPETENCIES.some((c) => !p[camelCaseKey(c)])) {
        setError("Please fill every Title and select all Levels.");
        return;
      }
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/generate-competencies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(framework),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error("API error");

      // assign breakdown by index
      setFramework((f) => ({
        ...f,
        positions: f.positions.map((p, idx) => ({
          ...p,
          breakdown:
            data.competencyDescriptions[idx]?.breakdown ||
            p.breakdown,
        })),
      }));
      setSuccess("Descriptions generated!");
    } catch {
      setError("Failed to generate descriptions.");
    } finally {
      setLoading(false);
    }
  };

  // ... saveFramework & downloadCSV unchanged ...

  return (
    <Box maxW="100%" mx="auto" p="6">
      <Heading mb="4">Competency Framework</Heading>

      {/* Department selector */}
      <Box ref={deptRef} mb="6" position="relative" maxW="400px">
        <Input
          placeholder="Select Department"
          value={deptQuery}
          onFocus={() => setShowDeptDropdown(true)}
          onChange={(e) => {
            setDeptQuery(e.target.value);
            setShowDeptDropdown(true);
          }}
          bg="white"
        />
        {showDeptDropdown && (
          <Box
            position="absolute"
            bg="white"
            w="full"
            border="1px solid gray"
            maxH="200px"
            overflowY="auto"
            zIndex={100}
          >
            {departments
              .filter((d) =>
                d.department
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
                    setFramework((f) => ({
                      ...f,
                      department: d.id,
                    }));
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

      {/* Table of Positions × Levels */}
      <Box overflowX="auto" mb="4">
        <Table
          size="sm"
          variant="striped"
          colorScheme="gray"
          minW="800px"
        >
          <Thead>
            <Tr>
              <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                Position
              </Th>
              {COMPETENCIES.map((c) => (
                <Th
                  key={c}
                  fontSize="xs"
                  position="sticky"
                  top={0}
                  bg="gray.50"
                  zIndex={2}
                >
                  {c}
                </Th>
              ))}
              <Th position="sticky" top={0} bg="gray.50" zIndex={2} />
            </Tr>
          </Thead>
          <Tbody>
            {framework.positions.map((pos, i) => (
              <Tr key={i}>
                <Td p="1">
                  <Input
                    size="xs"
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
                        size="xs"
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
                    size="xs"
                    icon={<DeleteIcon />}
                    aria-label="Remove"
                    onClick={() => removePosition(i)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <HStack mb="6">
        <Button leftIcon={<AddIcon />} onClick={addPosition} size="sm">
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
        {/* ... Save + Download buttons ... */}
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

      {/* Display Brave / Owners / Inclusive */}
      {framework.positions.some((p) =>
        Object.values(p.breakdown).some((v) => v)
      ) && (
        <VStack align="stretch" spacing="4" mt="6">
          <Heading size="md">Generated Descriptions</Heading>
          {framework.positions.map((p, i) => (
            <Box
              key={i}
              p="3"
              bg="gray.50"
              borderWidth="1px"
              borderRadius="md"
              shadow="sm"
            >
              <Text fontWeight="bold">{p.title}</Text>
              <VStack align="start" spacing="1" mt="2">
                <Text>
                  <Text as="span" fontWeight="semibold">
                    Brave:
                  </Text>{" "}
                  {p.breakdown.Brave}
                </Text>
                <Text>
                  <Text as="span" fontWeight="semibold">
                    Owners:
                  </Text>{" "}
                  {p.breakdown.Owners}
                </Text>
                <Text>
                  <Text as="span" fontWeight="semibold">
                    Inclusive:
                  </Text>{" "}
                  {p.breakdown.Inclusive}
                </Text>
              </VStack>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default CompetencyFramework;
