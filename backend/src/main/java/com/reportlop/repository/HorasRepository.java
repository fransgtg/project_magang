package com.reportlop.repository;

import com.reportlop.model.ViewHorasStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HorasRepository extends JpaRepository<ViewHorasStatus, String> {
    // Fungsi khusus untuk fitur search di data Horas
    Page<ViewHorasStatus> findByNamaLopContainingIgnoreCase(String namaLop, Pageable pageable);
}