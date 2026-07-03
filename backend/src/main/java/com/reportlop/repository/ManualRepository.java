package com.reportlop.repository;

import com.reportlop.model.TabelManual;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ManualRepository extends JpaRepository<TabelManual, String> {
    // Fungsi khusus untuk fitur search
    // Secara otomatis akan menjalankan query: SELECT * FROM tabel_manual WHERE lop ILIKE %search%
    Page<TabelManual> findByLopContainingIgnoreCase(String lop, Pageable pageable);
}