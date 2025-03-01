import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  TableContainer,
  Flex,
  Button,
} from "@chakra-ui/react";
import { ArrowUpIcon, ArrowDownIcon, SearchIcon } from "@chakra-ui/icons";

const CandidateTable = ({ candidates }) => {
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("📌 Candidates received in Table:", candidates);
  }, [candidates]);

  // Filter candidates based on name
  const filteredCandidates = candidates.filter((candidate) =>
    candidate.name?.toLowerCase().includes(filter.toLowerCase())
  );

  // Sort candidates based on sortKey and sortOrder
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === "asc" ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <Box p={6} bg="white" shadow="md" borderRadius="lg">
      {/* Search Bar */}
      <Flex mb={4} align="center">
        <Input
          placeholder="Search by name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          bg="gray.100"
          width="300px"
          mr={2}
        />
        <SearchIcon color="gray.500" />
      </Flex>

      {/* Table Container */}
      <TableContainer>
        <Table variant="simple">
          <Thead bg="gray.100">
            <Tr>
              <Th cursor="pointer" onClick={() => handleSort("name")}>
                Name{" "}
                {sortKey === "name" &&
                  (sortOrder === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />)}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort("department")}>
                Department{" "}
                {sortKey === "department" &&
                  (sortOrder === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />)}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort("interview_date")}>
                Interview Date{" "}
                {sortKey === "interview_date" &&
                  (sortOrder === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />)}
              </Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedCandidates.length > 0 ? (
              sortedCandidates.map((candidate) => (
                <Tr key={candidate.candidate_id} _hover={{ bg: "gray.50" }}>
                  <Td>{candidate.name || "N/A"}</Td>
                  <Td>{candidate.department || "Unknown"}</Td>
                  <Td>
                    {candidate.interview_date
                      ? new Date(candidate.interview_date).toLocaleDateString()
                      : "N/A"}
                  </Td>
                  <Td>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() =>
                        navigate(`/candidate/${candidate.candidate_id}`)
                      }
                    >
                      View
                    </Button>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan="4" textAlign="center" color="gray.500">
                  No candidates found.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CandidateTable;

