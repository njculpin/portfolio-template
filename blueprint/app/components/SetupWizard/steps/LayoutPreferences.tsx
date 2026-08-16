import type { ReactNode } from 'react';
import styles from '../SetupWizard.module.css';

/* Preview primitives — tiny CSS drawings of each layout, no images required. */

function Frame({
  children,
  column = false,
  flush = false,
}: {
  children: ReactNode;
  column?: boolean;
  flush?: boolean;
}) {
  const classes = [
    styles.preview,
    column ? styles.previewCol : '',
    flush ? styles.previewFlush : '',
  ];
  return (
    <div className={classes.filter(Boolean).join(' ')} aria-hidden="true">
      {children}
    </div>
  );
}

function Tile({ grow = 1 }: { grow?: number | string }) {
  return <div className={styles.pvTile} style={{ flex: grow }} />;
}

function Tiles({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.pvTile} />
      ))}
    </>
  );
}

function Col({ children, grow = 1 }: { children: ReactNode; grow?: number }) {
  return (
    <div className={styles.pvCol} style={{ flex: grow }}>
      {children}
    </div>
  );
}

function Row({ children, grow = 1 }: { children: ReactNode; grow?: number }) {
  return (
    <div className={styles.pvRow} style={{ flex: grow }}>
      {children}
    </div>
  );
}

type LayoutOption = {
  id: string;
  title: string;
  description: string;
  preview: ReactNode;
};

const HOMEPAGE_OPTIONS: LayoutOption[] = [
  {
    id: 'grid',
    title: 'Grid',
    description: 'Uniform grid of project thumbnails.',
    preview: (
      <Frame>
        <div className={styles.pvGrid}>
          <Tiles count={9} />
        </div>
      </Frame>
    ),
  },
  {
    id: 'masonry',
    title: 'Masonry',
    description: 'Pinterest-style variable height layout.',
    preview: (
      <Frame>
        <Col>
          <Tile grow={2} />
          <Tile grow={1} />
        </Col>
        <Col>
          <Tile grow={1} />
          <Tile grow={2.2} />
        </Col>
        <Col>
          <Tile grow={1.4} />
          <Tile grow={1} />
        </Col>
      </Frame>
    ),
  },
  {
    id: 'columnized',
    title: 'Columnized',
    description: 'Stacked columns with varying widths.',
    preview: (
      <Frame>
        <Col grow={1.7}>
          <Tile grow={1.3} />
          <Tile grow={1} />
        </Col>
        <Col grow={1}>
          <Tile />
          <Tile />
          <Tile />
        </Col>
        <Col grow={0.7}>
          <Tile />
          <Tile grow={1.5} />
        </Col>
      </Frame>
    ),
  },
  {
    id: 'justify',
    title: 'Justified',
    description: 'Edge-to-edge rows of images.',
    preview: (
      <Frame column flush>
        <Row>
          <Tile grow={2} />
          <Tile grow={1} />
          <Tile grow={1.4} />
        </Row>
        <Row>
          <Tile grow={1} />
          <Tile grow={2.4} />
        </Row>
        <Row>
          <Tile grow={1.6} />
          <Tile grow={1} />
          <Tile grow={1.1} />
        </Row>
      </Frame>
    ),
  },
];

const PROJECT_OPTIONS: LayoutOption[] = [
  {
    id: 'scroll',
    title: 'Scroll',
    description: 'Vertical scroll through project media.',
    preview: (
      <Frame column>
        <Tile grow="0 0 46%" />
        <Tile grow="0 0 46%" />
        <Tile grow="0 0 46%" />
      </Frame>
    ),
  },
  {
    id: 'slideshow',
    title: 'Slideshow',
    description: 'Full-screen image-by-image navigation.',
    preview: (
      <Frame>
        <div className={styles.pvStage}>
          <Tile />
          <div className={styles.pvDots}>
            <span />
            <span />
            <span />
          </div>
        </div>
      </Frame>
    ),
  },
  {
    id: 'splitview',
    title: 'Split View',
    description: 'Media on one side, details on the other.',
    preview: (
      <Frame>
        <Tile grow={1.6} />
        <div className={styles.pvLines}>
          <span className={styles.pvLine} />
          <span className={styles.pvLine} />
          <span className={styles.pvLine} />
        </div>
      </Frame>
    ),
  },
];

const NAVIGATION_OPTIONS: LayoutOption[] = [
  {
    id: 'topbar',
    title: 'Top Bar',
    description: 'Horizontal navigation at the top.',
    preview: (
      <Frame column>
        <div className={styles.pvBar}>
          <span className={styles.pvMark} />
          <span className={styles.pvSpacer} />
          <span className={styles.pvDash} />
          <span className={styles.pvDash} />
          <span className={styles.pvDash} />
        </div>
        <div className={styles.pvGrid}>
          <Tiles count={6} />
        </div>
      </Frame>
    ),
  },
  {
    id: 'sidebar',
    title: 'Sidebar',
    description: 'Vertical navigation on the side.',
    preview: (
      <Frame>
        <div className={styles.pvSide}>
          <span className={styles.pvMark} />
          <span className={styles.pvDash} />
          <span className={styles.pvDash} />
          <span className={styles.pvDash} />
        </div>
        <div className={styles.pvGrid2}>
          <Tiles count={4} />
        </div>
      </Frame>
    ),
  },
  {
    id: 'overlay',
    title: 'Overlay',
    description: 'Full-screen overlay menu on toggle.',
    preview: (
      <Frame>
        <div className={styles.pvStage}>
          <div className={styles.pvGrid}>
            <Tiles count={6} />
          </div>
          <div className={styles.pvScrim} />
          <div className={styles.pvMenu}>
            <span className={styles.pvMenuLine} />
            <span className={styles.pvMenuLine} />
            <span className={styles.pvMenuLine} />
          </div>
        </div>
      </Frame>
    ),
  },
];

type OptionGroupProps = {
  title: string;
  options: LayoutOption[];
  value: string;
  onChange: (id: string) => void;
};

function OptionGroup({ title, options, value, onChange }: OptionGroupProps) {
  return (
    <div className={styles.layoutSection}>
      <h3 className={styles.layoutSectionTitle}>{title}</h3>
      <div className={styles.cardGrid}>
        {options.map((option) => (
          <div
            key={option.id}
            className={`${styles.card} ${value === option.id ? styles.cardSelected : ''}`}
            onClick={() => onChange(option.id)}
          >
            {option.preview}
            <div className={styles.cardTitle}>{option.title}</div>
            <div className={styles.cardDescription}>{option.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

type LayoutPreferencesProps = {
  formData: { homepage: string; project: string; navigation: string };
  updateFormData: (updates: { homepage?: string; project?: string; navigation?: string }) => void;
};

export default function LayoutPreferences({ formData, updateFormData }: LayoutPreferencesProps) {
  return (
    <div>
      <h2 className={styles.stepTitle}>Layout preferences</h2>
      <p className={styles.stepDescription}>
        Choose how your portfolio is structured and navigated. Each preview shows the shape of the
        layout.
      </p>

      <OptionGroup
        title="Homepage"
        options={HOMEPAGE_OPTIONS}
        value={formData.homepage}
        onChange={(val) => updateFormData({ homepage: val })}
      />

      <OptionGroup
        title="Project Page"
        options={PROJECT_OPTIONS}
        value={formData.project}
        onChange={(val) => updateFormData({ project: val })}
      />

      <OptionGroup
        title="Navigation"
        options={NAVIGATION_OPTIONS}
        value={formData.navigation}
        onChange={(val) => updateFormData({ navigation: val })}
      />
    </div>
  );
}
